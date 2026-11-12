package vn.doan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // Mở ra nếu ông có xài Spring Security
import org.springframework.web.bind.annotation.*;
import vn.doan.dto.request.ProductCreateRequest;
import vn.doan.dto.response.ProductResponse;
import vn.doan.domain.User;
import vn.doan.service.CategoryService;
import vn.doan.service.ProductService;
import vn.doan.service.UserService;
import vn.doan.dto.request.UpdateRoleRequest;
import vn.doan.dto.request.UserCreateRequest;
import vn.doan.dto.response.UpdateRoleResponse;
import java.util.HashMap;
import java.util.Map;
import vn.doan.dto.request.CategoryCreateRequest;
import vn.doan.dto.response.CategoryResponse;
import vn.doan.dto.request.ProductRequest;
import vn.doan.dto.request.UserUpdateRequest;
import vn.doan.dto.request.IngredientCreateRequest;
import vn.doan.dto.request.InventoryTransactionCreateRequest;
import vn.doan.dto.request.PromotionAdminRequest;
import vn.doan.domain.Customer;
import vn.doan.dto.response.UserResponse;
import vn.doan.dto.response.IngredientResponse;
import vn.doan.dto.response.InventoryTransactionResponse;
import vn.doan.dto.response.PromotionAdminResponse;
import vn.doan.repository.UserRepository;
import vn.doan.service.InventoryService;
import vn.doan.service.PromotionService;
import vn.doan.service.OrderService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;
    @Autowired

    private CategoryService categoryService;
    @Autowired private UserRepository userRepository;
    @Autowired private InventoryService inventoryService;
    @Autowired private PromotionService promotionService;
    @Autowired private OrderService orderService;

    // ==========================================
    // 1. QUẢN LÝ MENU (SẢN PHẨM)
    // ==========================================

    // THÊM MỚI MÓN NƯỚC (POST: /api/admin/products)
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable String id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers")
    public List<UserResponse> customers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().toUpperCase().contains("CUSTOMER"))
                .map(this::mapUser).collect(Collectors.toList());
    }

    @PutMapping("/customers/{id}")
    public UserResponse updateCustomer(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng."));
        if (request.getUsername() != null && !request.getUsername().equalsIgnoreCase(user.getUsername())) {
            userRepository.findByUsernameIgnoreCase(request.getUsername())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> { throw new IllegalArgumentException("Tên đăng nhập đã tồn tại."); });
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
            Customer customer = user.getInfo();
            if (customer == null) {
                customer = new Customer();
                customer.setUser(user);
                user.setInfo(customer);
            }
            customer.setName(request.getFullName());
            customer.setPhone(request.getPhone() == null ? user.getPhone() : request.getPhone());
        }
        Customer customer = user.getInfo();
        if (customer != null) {
            if (request.getGender() != null) customer.setGender(request.getGender());
            if (request.getDateOfBirth() != null) customer.setDateOfBirth(request.getDateOfBirth());
            if (request.getAddress() != null) customer.setAddress(request.getAddress());
        }
        return mapUser(userRepository.save(user));
    }

    @GetMapping("/inventory")
    public List<IngredientResponse> inventory() { return inventoryService.getAllIngredients(); }

    @PostMapping("/inventory")
    public IngredientResponse createIngredient(@RequestBody IngredientCreateRequest request) {
        return inventoryService.createIngredient(request);
    }

    @PostMapping("/inventory/transactions")
    public ResponseEntity<Void> inventoryTransaction(@RequestBody InventoryTransactionCreateRequest request) {
        inventoryService.createInventoryTransaction(request, request.getBaristaId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/inventory/transactions")
    public List<InventoryTransactionResponse> inventoryTransactions() {
        return inventoryService.getAllTransactions();
    }

    @GetMapping("/promotions")
    public List<PromotionAdminResponse> promotions() { return promotionService.getAdminPromotions(); }

    @PostMapping("/promotions")
    public PromotionAdminResponse createPromotion(@RequestBody PromotionAdminRequest request) {
        return promotionService.createAdminPromotion(request);
    }

    @PutMapping("/promotions/{id}")
    public PromotionAdminResponse updatePromotion(@PathVariable String id, @RequestBody PromotionAdminRequest request) {
        return promotionService.updateAdminPromotion(id, request);
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable String id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/revenue")
    public Map<String, Object> revenue(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        LocalDate start = from == null ? LocalDate.now() : from;
        LocalDate end = to == null ? start : to;
        LocalDateTime startTime = start.atStartOfDay();
        LocalDateTime endTime = end.plusDays(1).atStartOfDay().minusNanos(1);
        return Map.of("from", start, "to", end,
                "revenue", orderService.calculateRevenue(startTime, endTime),
                "orders", orderService.getCompletedOrdersInRange(startTime, endTime).size());
    }

    private UserResponse mapUser(User user) {
        UserResponse response = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getAvatarUrl(), user.getCreatedAt(), user.getUpdatedAt(),
                user.getInfo() == null ? null : user.getInfo().getId(),
                user.getBarista() == null ? null : user.getBarista().getId(),
                user.getFullName(), user.getPhone());
        if (user.getInfo() != null) {
            response.setGender(user.getInfo().isGender());
            response.setAddress(user.getInfo().getAddress());
            response.setDateOfBirth(user.getInfo().getDateOfBirth());
        }
        response.setPosition(user.getPosition());
        return response;
    }

    // ==========================================
    // 2. QUẢN LÝ NHÂN SỰ
    // ==========================================

    // THÊM NHÂN VIÊN MỚI (POST: /api/admin/staffs)
    @PostMapping("/staffs")
    public ResponseEntity<Map<String,Object>>createStaff(@RequestBody UserCreateRequest request) {
        Object savedStaff = userService.createStaff(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo tài khoản nhân viên thành công!");
        response.put("data", savedStaff);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // THAY ĐỔI QUYỀN NHÂN VIÊN (PUT: /api/admin/staffs/{id}/role)
    // Ví dụ: Đổi quyền từ BARISTA (Pha chế) sang MANAGER (Quản lý)
  @PutMapping("/staffs/{targetUserId}/role")
    public ResponseEntity<Map<String,Object>>  updateStaffRole(
            @PathVariable String targetUserId, // Sửa thành String cho khớp với Service
            @RequestBody UpdateRoleRequest request) { // Hứng DTO từ Frontend gửi lên
            
        // Gọi Service update quyền nhân viên
        UpdateRoleResponse updatedRole = userService.updateStaffRole(targetUserId, request);        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã cập nhật quyền cho nhân viên!");
        response.put("data", updatedRole);
        
        return ResponseEntity.ok(response);
    }
    
    // ==========================================
    // 3. QUẢN LÝ DANH MỤC (CATEGORIES) - BẢO MẬT BỞI ADMIN
    // ==========================================

    // THÊM DANH MỤC MỚI (POST: /api/admin/categories)
    @PostMapping("/categories")
    public ResponseEntity<Map<String,Object>> createCategory(@RequestBody CategoryCreateRequest request) {
       
        CategoryResponse newCategory = categoryService.createCategory(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thêm danh mục mới thành công!");
        response.put("data", newCategory);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // CẬP NHẬT TÊN/MÔ TẢ DANH MỤC (PUT: /api/admin/categories/{id})
    @PutMapping("/categories/{id}")
    public ResponseEntity<Map<String,Object>>  updateCategory(
            @PathVariable String id, 
            @RequestBody CategoryCreateRequest request) {
            
        // Gọi hàm updateCategory 
        CategoryResponse updatedCategory = categoryService.updateCategory(id, request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật danh mục thành công!");
        response.put("data", updatedCategory);
        
        return ResponseEntity.ok(response);
    }

    // BẬT/TẮT TRẠNG THÁI DANH MỤC (PUT: /api/admin/categories/{id}/toggle-status)
@PutMapping("/categories/{id}/toggle-status")
public ResponseEntity<Map<String,Object>>  toggleCategoryStatus(@PathVariable String id) {
    
    CategoryResponse updatedCategory = categoryService.toggleCategoryStatus(id);
    
    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("message", "Thay đổi trạng thái danh mục thành công!");
    response.put("data", updatedCategory);
    
    return ResponseEntity.ok(response);
}
}