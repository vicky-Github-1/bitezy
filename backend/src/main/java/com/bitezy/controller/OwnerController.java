package com.bitezy.controller;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.*;
import com.bitezy.repository.OrderRepository;
import com.bitezy.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController @RequestMapping("/api/owner") @RequiredArgsConstructor
public class OwnerController {
    private final ProductService products;
    private final OrderService orders;
    private final OrderRepository orderRepository;
    @PostMapping("/products") public Product create(@Valid @RequestBody ProductRequest r){return products.create(r);}
    @PutMapping("/products/{id}") public Product update(@PathVariable Long id,@Valid @RequestBody ProductRequest r){return products.update(id,r);}
    @DeleteMapping("/products/{id}") public Map<String,String> delete(@PathVariable Long id){products.delete(id);return Map.of("message","Deleted");}
    @GetMapping("/orders") public List<Order> allOrders(){return orders.ownerOrders();}
    @GetMapping("/orders/{id}") public Order order(@PathVariable Long id){return orderRepository.findById(id).filter(o->o.getPaymentStatus()==PaymentStatus.PAID).orElseThrow(()->new RuntimeException("Order not found")); }
    @PutMapping("/orders/{id}/status") public Order status(@PathVariable Long id,@Valid @RequestBody StatusRequest r){return orders.updateStatus(id,r);}
    @GetMapping("/dashboard") public Map<String,Object> dashboard(){
        List<Order> paid=orderRepository.findAllByOrderByCreatedAtDesc().stream().filter(o->o.getPaymentStatus()==PaymentStatus.PAID).toList();
        long pending=paid.stream().filter(o->o.getStatus()!=OrderStatus.DELIVERED&&o.getStatus()!=OrderStatus.CANCELLED).count();
        long completed=paid.stream().filter(o->o.getStatus()==OrderStatus.DELIVERED).count();
        return Map.of("totalOrders",paid.size(),"pendingOrders",pending,"completedOrders",completed,
                "totalRevenue",orderRepository.totalPaidRevenue());
    }
}
