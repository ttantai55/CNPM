package vn.doan.controller; 

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.doan.dto.response.CategoryResponse;
import vn.doan.dto.response.ProductResponse; 
import vn.doan.service.ProductService;
import vn.doan.service.CategoryService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
    private final ProductService productService;
    private final CategoryService categoryService; // Thêm vào nếu cần lấy danh sách danh mục

    public MenuController(ProductService productService , CategoryService categoryService ) {
        this.productService = productService;
        this.categoryService = categoryService;
    }


    // 1. QUẢN LÝ DANH MỤC (CATEGORIES)
   

    @GetMapping("/categories")
    public ResponseEntity<Map<String,Object>>  getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", categories);
        response.put("message", "API lấy danh sách danh mục đang phát triển...");
        
        return ResponseEntity.ok(response);
    }
    // LẤY CHI TIẾT 1 DANH MỤC THEO ID
    @GetMapping("/categories/{id}")
    public ResponseEntity<Map<String,Object>>  getCategoryById(@PathVariable String id) {
        // Gọi hàm getCategoryById từ Service[cite: 14]
        CategoryResponse category = categoryService.getCategoryById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", category);
        
        return ResponseEntity.ok(response);
    }

 
 
    @GetMapping("/products")
    public ResponseEntity<Map<String,Object>>  getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        
        return ResponseEntity.ok(response);
    }

    // 2. LẤY CHI TIẾT 1 MÓN THEO ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String,Object>> getProductById(@PathVariable String id) {
        ProductResponse product = productService.getProductById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", product);
        
        return ResponseEntity.ok(response);
    }

    
    // GET: /api/products/category/{categoryId}
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Map<String,Object>> getProductsByCategory(@PathVariable String categoryId) {
        List<ProductResponse> products = productService.getProductsByCategory(categoryId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", products);
        
        return ResponseEntity.ok(response);
    }
}