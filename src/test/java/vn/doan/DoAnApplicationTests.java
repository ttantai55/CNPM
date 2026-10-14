package vn.doan;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@SpringBootTest
@Import(DoAnApplicationTests.TestJdbcConfiguration.class)
class DoAnApplicationTests {

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
