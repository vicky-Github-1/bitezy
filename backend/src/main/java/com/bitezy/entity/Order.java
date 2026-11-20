package com.bitezy.entity;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.EAGER) @JoinColumn(name="customer_id")
    @JsonIgnore
    private User customer;
    @Column(nullable=false) private String customerName;
    @Column(nullable=false, length=500) private String deliveryAddress;
    @Column(nullable=false) private String phoneNumber;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal subtotal;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal deliveryFee;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private PaymentStatus paymentStatus;
    @Column(unique=true) private String razorpayOrderId;
    @Column private String razorpayPaymentId;
    @Column(nullable=false) private LocalDateTime createdAt;
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.EAGER)
    @Builder.Default private List<OrderItem> items=new ArrayList<>();

    @PrePersist void onCreate(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
}
