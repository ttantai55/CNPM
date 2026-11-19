package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.domain.Topping;
import vn.doan.dto.response.ToppingResponse;
import vn.doan.exception.ResourceNotFoundException;
import vn.doan.repository.ToppingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ToppingService {
    private final ToppingRepository toppingRepository;

    @Transactional(readOnly = true)
    public List<ToppingResponse> getAllToppings() {
        return toppingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ToppingResponse updateAvailability(String id, boolean available) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy topping."));
        topping.setAvailable(available);
        return toResponse(topping);
    }

    private ToppingResponse toResponse(Topping topping) {
        return new ToppingResponse(topping.getId(), topping.getName(), topping.getPrice(), topping.isAvailable());
    }
}
