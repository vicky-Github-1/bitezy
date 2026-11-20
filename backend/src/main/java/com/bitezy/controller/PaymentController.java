package com.bitezy.controller;
import com.bitezy.dto.Dtos.*;
import com.bitezy.entity.Order;
import com.bitezy.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/payment") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentService payments;
    @PostMapping("/create-order") public RazorpayCreateResponse create(@Valid @RequestBody PaymentCreateRequest r){return payments.createOrder(r);}
    @PostMapping("/verify") public Order verify(@Valid @RequestBody PaymentVerifyRequest r){return payments.verify(r);}
}
