package com.bitezy.repository;
import com.bitezy.entity.Order;
import com.bitezy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Order> findAllByOrderByCreatedAtDesc();
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    @Query("select coalesce(sum(o.totalAmount),0) from Order o where o.paymentStatus=com.bitezy.entity.PaymentStatus.PAID")
    java.math.BigDecimal totalPaidRevenue();
}
