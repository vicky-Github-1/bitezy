package com.bitezy.controller;
import com.bitezy.entity.Product;
import com.bitezy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequiredArgsConstructor
public class ProductController {
    private final ProductService products;
    @GetMapping("/api/products") public List<Product> all(){return products.all();}
    @GetMapping("/api/products/{id}") public Product get(@PathVariable Long id){return products.get(id);}
}
