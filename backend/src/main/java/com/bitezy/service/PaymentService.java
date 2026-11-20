package com.bitezy.service;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.*;
import com.bitezy.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {
    private final OrderRepository orders;
    @Value("${bitezy.payment.mock}") private boolean mock;
    @Value("${razorpay.key-id}") private String keyId;
    @Value("${razorpay.key-secret}") private String keySecret;
    public PaymentService(OrderRepository orders){this.orders=orders;}

    public RazorpayCreateResponse createOrder(PaymentCreateRequest r){
        Order order=orders.findById(r.orderId()).orElseThrow(()->new RuntimeException("Order not found"));
        if(order.getPaymentStatus()==PaymentStatus.PAID) throw new RuntimeException("Order is already paid");
        long paise=order.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();
        if(mock){
            String mockId="mock_"+order.getId()+"_"+System.currentTimeMillis();
            order.setRazorpayOrderId(mockId); orders.save(order);
            return new RazorpayCreateResponse(mockId,paise,"INR","",order.getTotalAmount(),true);
        }
        if(keyId.isBlank()||keySecret.isBlank()) throw new RuntimeException("Razorpay is not configured");
        try{
            RazorpayClient client=new RazorpayClient(keyId,keySecret);
            JSONObject request=new JSONObject().put("amount",paise).put("currency","INR")
                    .put("receipt","bitezy-"+order.getId());
            com.razorpay.Order created=client.orders.create(request);
            order.setRazorpayOrderId(created.get("id")); orders.save(order);
            return new RazorpayCreateResponse(created.get("id"),paise,"INR",keyId,order.getTotalAmount(),false);
        }catch(RazorpayException e){throw new RuntimeException("Unable to create Razorpay order");}
    }

    @Transactional
    public Order verify(PaymentVerifyRequest r){
        Order order=orders.findById(Long.parseLong(r.orderId())).orElseThrow(()->new RuntimeException("Order not found"));
        if(order.getPaymentStatus()==PaymentStatus.PAID) return order;
        if(!r.razorpayOrderId().equals(order.getRazorpayOrderId()))
            throw new RuntimeException("Payment order mismatch");
        if(mock){
            if(!r.razorpayPaymentId().startsWith("mock_pay_")||r.razorpaySignature().isBlank())
                throw new RuntimeException("Invalid mock payment");
        } else {
            if(keySecret.isBlank()) throw new RuntimeException("Razorpay is not configured");
            String data=r.razorpayOrderId()+"|"+r.razorpayPaymentId();
            if(!hmacSha256(data,keySecret).equals(r.razorpaySignature()))
                throw new RuntimeException("Payment signature verification failed");
        }
        order.setRazorpayPaymentId(r.razorpayPaymentId());
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.PLACED);
        return orders.save(order);
    }
    private String hmacSha256(String data,String secret){
        try{
            Mac mac=Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
            byte[] bytes=mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder out=new StringBuilder();
            for(byte b:bytes) out.append(String.format("%02x",b));
            return out.toString();
        }catch(Exception e){throw new RuntimeException("Payment verification failed");}
    }
}
