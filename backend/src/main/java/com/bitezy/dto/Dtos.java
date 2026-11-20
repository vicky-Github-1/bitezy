package com.bitezy.dto;
import com.bitezy.entity.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class Dtos {
    public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email,
                                  @NotBlank @Size(min=6) String password, @NotBlank String confirmPassword,
                                  @NotNull UserRole role, String secretPin) {}
    public record AuthRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record GoogleRequest(@NotBlank String credential) {}
    public record AuthResponse(String token, String fullName, String email, UserRole role) {}
    public record ProductRequest(@NotBlank String name, String description, @NotNull @Positive BigDecimal price,
                                 @NotBlank String category, String imageUrl, boolean available) {}
    public record CartItemRequest(@NotNull Long productId, @NotNull @Positive Integer quantity) {}
    public record CheckoutRequest(@NotBlank String customerName, @NotBlank String deliveryAddress,
                                  @NotBlank String phoneNumber, @NotEmpty List<CartItemRequest> items) {}
    public record PaymentCreateRequest(@NotNull Long orderId) {}
    public record PaymentVerifyRequest(@NotBlank String orderId, @NotBlank String razorpayOrderId,
                                       @NotBlank String razorpayPaymentId, @NotBlank String razorpaySignature) {}
    public record StatusRequest(@NotNull OrderStatus status) {}
    public record RazorpayCreateResponse(String razorpayOrderId, long amount, String currency, String keyId,
                                         BigDecimal totalAmount, boolean mock) {}
}
