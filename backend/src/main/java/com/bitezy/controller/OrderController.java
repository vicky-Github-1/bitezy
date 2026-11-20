package com.bitezy.controller;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.Order;
import com.bitezy.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
    private final OrderService orders;
    @PostMapping public Order create(@Valid @RequestBody CheckoutRequest r){return orders.createDraft(r);}
    @GetMapping("/my-orders") public List<Order> mine(){return orders.myOrders().stream().filter(o->o.getPaymentStatus()==com.bitezy.entity.PaymentStatus.PAID).toList();}
}
