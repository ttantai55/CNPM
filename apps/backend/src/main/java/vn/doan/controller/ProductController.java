package vn.doan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.doan.dto.request.CategoryCreateRequest;
import vn.doan.dto.request.ProductCreateRequest;
import vn.doan.dto.response.CategoryResponse;
import vn.doan.dto.response.ProductResponse;
import vn.doan.dto.response.ToppingResponse;
import vn.doan.service.CategoryService;
import vn.doan.service.ProductService;
import vn.doan.service.ToppingService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final ToppingService toppingService;

    @GetMapping("/api/products")
    public List<ProductResponse> products() { return productService.getAllProducts(); }

    @GetMapping("/api/products/{id}")
    public ProductResponse product(@PathVariable String id) { return productService.getProductById(id); }

    @GetMapping("/api/categories")
    public List<CategoryResponse> categories() { return categoryService.getActiveCategories(); }

    @GetMapping("/api/toppings")
    public List<ToppingResponse> toppings() {
        return toppingService.getAllToppings();
    }

    @PostMapping("/api/categories")
    public CategoryResponse createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/api/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable String id, @Valid @RequestBody CategoryCreateRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @PatchMapping("/api/categories/{id}/status")
    public CategoryResponse toggleCategory(@PathVariable String id) { return categoryService.toggleCategoryStatus(id); }

    @PostMapping("/api/products")
    public ProductResponse createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return productService.createProduct(request);
    }
}
