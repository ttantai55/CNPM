package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.LoyaltyTransaction;
import vn.doan.domain.Order;
import vn.doan.domain.User;
import vn.doan.domain.enums.LoyalType;
import vn.doan.dto.request.LoyaltyTransactionRequest;
import vn.doan.dto.response.LoyaltyTransactionResponse;
import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoyaltyService {

    private final LoyaltyTransactionRepo loyaltyTransactionRepo;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    // * 1. Lấy lịch sử tiêu điểm của user
    public List<LoyaltyTransactionResponse> getUserLoyaltyHistory(String userId) {
        List<LoyaltyTransaction> history = loyaltyTransactionRepo.findByUserId(userId);
        
        return history.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // * 2. Tạo giao dịch điểm thủ công
    @Transactional
    public LoyaltyTransactionResponse processManualTransaction(LoyaltyTransactionRequest request) {
        // Kiểm tra User
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        // Kiểm tra Order
        Order order = null;
        if (request.getOrderId() != null && !request.getOrderId().trim().isEmpty()) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        }

        LoyalType type;
        try {
            type = LoyalType.valueOf(request.getTransactionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại giao dịch điểm không hợp lệ.");
        }

        // Lấy số dư hiện tại của khách hàng
        List<LoyaltyTransaction> history = loyaltyTransactionRepo.findByUserId(user.getId());
        int currentBalance = history.isEmpty() ? 0 : history.get(history.size() - 1).getBalancedAfter();

        // Tính số dư mới
        int newBalance;
        if (type == LoyalType.REDEEM) {
            if (currentBalance < request.getPoints()) {
                throw new IllegalStateException("Số dư điểm không đủ để thực hiện giao dịch này.");
            }
            newBalance = currentBalance - request.getPoints(); 
        } else {
            newBalance = currentBalance + request.getPoints(); 
        }

        // Tạo Entity mới và lưu
        LoyaltyTransaction transaction = new LoyaltyTransaction(
                user,
                order,
                type,
                request.getPoints(),
                newBalance,         
                request.getDescription() 
        );

        LoyaltyTransaction savedTransaction = loyaltyTransactionRepo.save(transaction);
        
        return mapToResponse(savedTransaction);
    }

    // --- HÀM TIỆN ÍCH DÙNG ĐỂ MAP SANG DTO RESPONSE ---
    private LoyaltyTransactionResponse mapToResponse(LoyaltyTransaction tx) {
        String orderId = tx.getOrder() != null ? tx.getOrder().getId() : null;

        return new LoyaltyTransactionResponse(
                tx.getId(),
                tx.getUser().getId(),
                orderId,
                tx.getTransactionType().name(),
                tx.getPoints(),
                tx.getBalancedAfter(),
                tx.getDescription(),
                tx.getCreateDate() // LocalDate[cite: 36]
        );
    }
}