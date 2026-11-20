package com.bitezy.config;
import com.bitezy.entity.Product;
import com.bitezy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component @RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final ProductRepository products;
    @Override public void run(String... args) {
        if(products.count()>0) return;
        products.saveAll(List.of(
            product("Margherita Pizza","Classic tomato sauce, mozzarella and basil","Pizza","https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",249),
            product("Pepperoni Feast","Loaded pepperoni and melted cheese","Pizza","https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",399),
            product("Classic Chicken Burger","Crispy chicken, lettuce and house sauce","Burger","https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",199),
            product("Paneer Supreme Burger","Grilled paneer, cheese and fresh vegetables","Burger","https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",229),
            product("Hyderabadi Chicken Biryani","Aromatic basmati rice with tender chicken","Biryani","https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",349),
            product("Veg Dum Biryani","Slow-cooked rice, vegetables and spices","Biryani","https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800",279),
            product("Hakka Noodles","Wok-tossed noodles with garden vegetables","Chinese","https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",179),
            product("Chilli Chicken","Spicy Indo-Chinese chicken","Chinese","https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800",299),
            product("Cold Coffee","Creamy chilled coffee","Beverages","https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",149),
            product("Fresh Lime Soda","Zesty sweet and salted lime soda","Beverages","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800",99),
            product("Chocolate Brownie","Warm fudgy brownie with chocolate sauce","Desserts","https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",169),
            product("Cheesecake","Creamy baked cheesecake with berry topping","Desserts","https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",219)
        ));
    }
    private Product product(String name,String desc,String category,String image,int price){
        return Product.builder().name(name).description(desc).category(category).imageUrl(image)
                .price(BigDecimal.valueOf(price)).available(true).build();
    }
}
