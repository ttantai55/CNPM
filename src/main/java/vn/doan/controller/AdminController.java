package vn.doan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // Mở ra nếu ông có xài Spring Security
import org.springframework.web.bind.annotation.*;
import vn.doan.dto.request.ProductCreateRequest;
import vn.doan.dto.response.ProductResponse;
import vn.doan.domain.Product;
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


@RestController
@RequestMapping("/api/admin")

public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;
    @Autowired

    private CategoryService categoryService;

    // ==========================================
    // 1. QUẢN LÝ MENU (SẢN PHẨM)
    // ==========================================

    // THÊM MỚI MÓN NƯỚC (POST: /api/admin/products)
  @PostMapping("/products")
    public  ResponseEntity<Map<String,Object>> createProduct(@RequestBody ProductCreateRequest request) {
        
        // Gọi đúng tên hàm createProduct bên Service và hứng kết quả bằng ProductResponse
        ProductResponse savedProduct = productService.createProduct(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã thêm món nước mới thành công!");
        response.put("data", savedProduct);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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