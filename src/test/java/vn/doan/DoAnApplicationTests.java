package vn.doan;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import vn.doan.repository.LoyaltyTransactionRepo;
import vn.doan.repository.OrderRepository;
import vn.doan.repository.ProductRepository;
import vn.doan.repository.PromotionRepository;
import vn.doan.repository.ToppingRepository;
import vn.doan.repository.UserRepository;
import vn.doan.repository.PaymentRepository;

@SpringBootTest
@Import(DoAnApplicationTests.TestJdbcConfiguration.class)
class DoAnApplicationTests {

    @MockBean private LoyaltyTransactionRepo loyaltyTransactionRepo;
    @MockBean private OrderRepository orderRepository;
    @MockBean private ProductRepository productRepository;
    @MockBean private PromotionRepository promotionRepository;
    @MockBean private ToppingRepository toppingRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private PaymentRepository paymentRepository;
    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class TestJdbcConfiguration {

        @Bean
        JdbcTemplate jdbcTemplate() {
            return new JdbcTemplate(new DriverManagerDataSource("jdbc:test-only"));
        }
    }
}
