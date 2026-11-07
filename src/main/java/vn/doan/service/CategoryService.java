package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Category;
import vn.doan.dto.request.CategoryCreateRequest;
import vn.doan.dto.response.CategoryResponse;
import vn.doan.repository.CategoryRepository;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.exception.BusinessValidationException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Tối ưu hiệu năng: Mặc định tất cả các hàm chỉ đọc dữ liệu
public class CategoryService {

    // Tiêm phụ thuộc bằng Constructor (Lombok tự sinh), tuyệt đối không dùng @Autowired
    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        // Tùy theo thiết kế Entity, nếu có trường isActive và displayOrder thì ông dùng hàm tự custom:
        // return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()...
        
        return categoryRepository.findAll().stream()
                .map(category -> new CategoryResponse(
                        category.getId(), 
                        category.getName(), 
                        category.getDescription()
                )).collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId));
        
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }

    @Transactional // Ghi đè Transactional để cho phép ghi dữ liệu (INSERT)
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        // 1. Kiểm tra trùng tên danh mục
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessValidationException("Tên danh mục đã tồn tại trong hệ thống");
        }

        // 2. Chuyển DTO -> Entity
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        // Nếu DB có cột trạng thái, set mặc định: category.setActive(true);

        // 3. Lưu xuống DB
        Category savedCategory = categoryRepository.save(category);

        return new CategoryResponse(savedCategory.getId(), savedCategory.getName(), savedCategory.getDescription());
    }

    @Transactional // Cho phép ghi dữ liệu (UPDATE)
    public CategoryResponse updateCategory(String categoryId, CategoryCreateRequest request) { 
        // Lấy dữ liệu lên, nếu không có ném lỗi 404
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId));
        
        // Kiểm tra trùng tên (nếu người dùng đổi sang tên khác đã tồn tại)
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new BusinessValidationException("Tên danh mục mới đã bị trùng");
        }

        // Đổ dữ liệu mới vào Entity đang bị quản lý (Managed State)
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        
        // KHÔNG CẦN GỌI categoryRepository.save(category)
        // JPA Dirty Checking sẽ tự động đối soát và sinh lệnh UPDATE khi kết thúc hàm

        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }

    @Transactional // Cho phép ghi dữ liệu (DELETE/UPDATE)
    public void deleteCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + categoryId));

        // Chỗ này xử lý Xóa Mềm (Soft Delete) theo đúng phân công nghiệp vụ
        // Giả sử ông có trường isActive trong Entity
        // category.setActive(false); 
        // Lại tận dụng Dirty Checking, không cần save()
        
        // Nếu ông muốn xóa cứng thì xài:
        categoryRepository.delete(category); 
    }
}