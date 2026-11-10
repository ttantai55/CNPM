package vn.doan.service;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Category;
import vn.doan.domain.Product;
import vn.doan.dto.request.ProductCreateRequest;
import vn.doan.dto.request.ProductRequest;
import vn.doan.dto.response.ProductResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.CategoryRepository;
import vn.doan.repository.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Lấy toàn bộ danh sách món nước trong thực đơn
     */
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết món theo ID
     */
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món nước"));
        return mapToResponse(product);
    }

    /**
     * Lấy danh sách món nước theo Danh mục
     */
    public List<ProductResponse> getProductsByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo mới một món nước
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục món"));

        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setStatus(true); // Mặc định khi tạo mới là true (có bán)
        product.setRating(request.getRating() == null ? 5.0 : request.getRating());
        product.setWeeklySalesCount(request.getWeeklySalesCount() == null ? 0 : request.getWeeklySalesCount());

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    /**
     * Cập nhật thông tin món nước
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món nước"));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục món"));
            product.setCategory(category);
        }
        if (request.getRating() != null) product.setRating(request.getRating());
        if (request.getWeeklySalesCount() != null) product.setWeeklySalesCount(request.getWeeklySalesCount());
        if (request.getStatus() != null) product.setStatus(request.getStatus());

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) throw new ResourceNotFoundException("Không tìm thấy món nước");
        productRepository.deleteById(id);
    }

    /**
     * Cập nhật trạng thái bật/tắt bán của món
     */
    @Transactional
    public ProductResponse updateProductStatus(String id, boolean status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món nước"));
        
        product.setStatus(status);
        return mapToResponse(productRepository.save(product));
    }

    // Helper map từ Entity sang DTO
    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getImageUrl(),
                product.isStatus(), // Nếu Entity của ông khai báo là isStatus() hoặc getStatus()
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getRating(),
                product.getWeeklySalesCount()
        );
    }
}