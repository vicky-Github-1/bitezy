package com.bitezy.service;
import com.bitezy.dto.Dtos.ProductRequest;
import com.bitezy.entity.Product;
import com.bitezy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ProductService {
    private final ProductRepository products;
    public List<Product> all(){ return products.findAll(); }
    public Product get(Long id){ return products.findById(id).orElseThrow(()->new RuntimeException("Product not found")); }
    public Product create(ProductRequest r){ return products.save(Product.builder().name(r.name()).description(r.description())
            .price(r.price()).category(r.category()).imageUrl(r.imageUrl()).available(r.available()).build()); }
    public Product update(Long id,ProductRequest r){
        Product p=get(id); p.setName(r.name()); p.setDescription(r.description()); p.setPrice(r.price());
        p.setCategory(r.category()); p.setImageUrl(r.imageUrl()); p.setAvailable(r.available()); return products.save(p);
    }
    public void delete(Long id){ products.delete(get(id)); }
}
