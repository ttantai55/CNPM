package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Barista;
import vn.doan.domain.Ingredient;
import vn.doan.domain.InventoryTransaction;
import vn.doan.domain.InventoryTransactionDetails;
import vn.doan.domain.enums.InventoryTransactionType;
import vn.doan.dto.request.InventoryTransactionCreateRequest;
import vn.doan.dto.request.IngredientCreateRequest;
import vn.doan.dto.response.IngredientResponse;
import vn.doan.dto.response.InventoryTransactionResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.BaristaRepository;
import vn.doan.repository.IngredientRepository;
import vn.doan.repository.InventoryTransactionRepository;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final IngredientRepository ingredientRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final BaristaRepository baristaRepository; // Thêm Repo này để lấy Barista

    /**
     * i. Lấy danh sách nguyên vật liệu trong kho
     */
public List<IngredientResponse> getAllIngredients() {
        return ingredientRepository.findAll().stream()
                .map(ing -> new IngredientResponse(
                        ing.getId(),
                        ing.getName(),
                        ing.getUnit(),                                        // UnitType
                        ing.getCurrentStock(),                                // int
                        ing.getMinAlertThreshold(),                           // double
                        ing.getCurrentStock() <= ing.getMinAlertThreshold()  // boolean isBelowThreshold
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public IngredientResponse createIngredient(IngredientCreateRequest request) {
        Ingredient ingredient = new Ingredient(request.getName(), request.getUnit(),
                request.getCurrentStock(), request.getMinAlertThreshold());
        Ingredient saved = ingredientRepository.save(ingredient);
        return new IngredientResponse(saved.getId(), saved.getName(), saved.getUnit(), saved.getCurrentStock(),
                saved.getMinAlertThreshold(), saved.getCurrentStock() <= saved.getMinAlertThreshold());
    }

    public List<InventoryTransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream().map(transaction -> {
            InventoryTransactionResponse response = new InventoryTransactionResponse();
            response.setId(transaction.getId());
            response.setType(transaction.getType());
            response.setCreateAt(transaction.getCreateAt());
            response.setNote(transaction.getNote());
            response.setBaristaName(transaction.getBarista().getName());
            if (transaction.getDetails() != null) {
                response.setIngredientId(transaction.getDetails().getIngredient().getId());
                response.setQuantity(transaction.getDetails().getQuantity());
                response.setPrice(transaction.getDetails().getPrice());
            }
            return response;
        }).toList();
    }

    /**
     * ii. Tạo phiếu nhập/xuất kho tay (Dành cho Barista hoặc Quản lý)
     */
    @Transactional
    public void createInventoryTransaction(InventoryTransactionCreateRequest request, String baristaId) {
        // 1. Tìm nguyên liệu và Barista thực hiện
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu"));
        
        Barista barista = baristaRepository.findById(baristaId)
                .orElseGet(() -> baristaRepository.save(new Barista("Quản lý")));

        int currentStock = ingredient.getCurrentStock();
        int transactionQty = (int) request.getQuantity(); // Ép kiểu vì Ingredient dùng int[cite: 7]

        // 2. Tính toán tồn kho dựa trên Enum InventoryTransactionType
        if (request.getType() == InventoryTransactionType.IMPORT) {
            ingredient.setCurrentStock(currentStock + transactionQty);
        } 
        else if (request.getType() == InventoryTransactionType.ADJUSTMENT) {
            ingredient.setCurrentStock(transactionQty);
        }
        else if (request.getType() == InventoryTransactionType.EXPORT) {
            if (currentStock < transactionQty) {
                throw new BusinessValidationException("Số lượng tồn kho không đủ để xuất/hủy!");
            }
            ingredient.setCurrentStock(currentStock - transactionQty);
        }

        // 3. Tạo phiếu giao dịch (Bảng inventory_transactions)
        InventoryTransaction transaction = new InventoryTransaction(
                request.getType(),
                request.getNote(),
                barista
        );

        // 4. Tạo chi tiết giao dịch (Bảng inventory_transaction_details)[cite: 10]
        InventoryTransactionDetails details = new InventoryTransactionDetails(
                transaction, // Gắn ngược lại vào phiếu tổng[cite: 10]
                ingredient,
                request.getQuantity(),
                request.getPrice()
        );

        // Link detail vào transaction (CascadeType.ALL sẽ tự lưu Details khi lưu Transaction)[cite: 8]
        transaction.setDetails(details); 

        // 5. Lưu xuống DB (Bảng Ingredient tự update qua Dirty Checking)
        transactionRepository.save(transaction);
    }

    /**
     * iv. Lọc nguyên liệu có số lượng tồn kho <= ngưỡng cảnh báo
     */
  public List<IngredientResponse> checkLowStockAlerts() {
        List<Ingredient> lowStockIngredients = ingredientRepository.findLowStockIngredients();
        
        return lowStockIngredients.stream()
                .map(ing -> new IngredientResponse(
                        ing.getId(),
                        ing.getName(),
                        ing.getUnit(),
                        ing.getCurrentStock(),
                        ing.getMinAlertThreshold(),
                        true // Đã nằm trong danh sách này thì chắc chắn isBelowThreshold = true
                ))
                .collect(Collectors.toList());
    }

    /**
     * iii. Tự động trừ nguyên liệu theo đơn hàng (Dành cho Phase 4)
     */
   
}