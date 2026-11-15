package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.repository.ProductRepository;

@Component
@RequiredArgsConstructor
public class WeeklySalesResetScheduler {

    private final ProductRepository productRepository;

    @Scheduled(cron = "0 0 0 * * MON", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void resetWeeklySalesCount() {
        productRepository.resetWeeklySalesCount();
    }
}
