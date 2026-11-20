package com.bitezy.service;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.*;
import com.bitezy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;

    private User currentUser(){
        String email=SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
    }
    @Transactional
    public Order createDraft(CheckoutRequest r){
        User user=currentUser();
        Order order=Order.builder().customer(user).customerName(r.customerName()).deliveryAddress(r.deliveryAddress())
                .phoneNumber(r.phoneNumber()).status(OrderStatus.PLACED).paymentStatus(PaymentStatus.PENDING)
                .deliveryFee(BigDecimal.ZERO).subtotal(BigDecimal.ZERO).totalAmount(BigDecimal.ZERO).build();
        BigDecimal subtotal=BigDecimal.ZERO;
        for(CartItemRequest item:r.items()){
            Product p=products.findById(item.productId()).orElseThrow(()->new RuntimeException("Product unavailable"));
            if(!p.isAvailable()) throw new RuntimeException(p.getName()+" is unavailable");
            OrderItem oi=OrderItem.builder().order(order).product(p).quantity(item.quantity())
                    .unitPrice(p.getPrice()).build();
            order.getItems().add(oi);
            subtotal=subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }
        BigDecimal fee=subtotal.compareTo(BigDecimal.valueOf(499))>=0?BigDecimal.ZERO:BigDecimal.valueOf(40);
        order.setSubtotal(subtotal); order.setDeliveryFee(fee); order.setTotalAmount(subtotal.add(fee));
        return orders.save(order);
    }
    public List<Order> myOrders(){ return orders.findByCustomerOrderByCreatedAtDesc(currentUser()); }
    public List<Order> ownerOrders(){ return orders.findAllByOrderByCreatedAtDesc().stream()
            .filter(o->o.getPaymentStatus()==PaymentStatus.PAID).toList(); }
    @Transactional public Order updateStatus(Long id,StatusRequest r){
        Order o=orders.findById(id).orElseThrow(()->new RuntimeException("Order not found"));
        o.setStatus(r.status()); return orders.save(o);
    }
}
