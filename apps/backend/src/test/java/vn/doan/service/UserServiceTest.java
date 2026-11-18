package vn.doan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.doan.domain.Barista;
import vn.doan.domain.User;
import vn.doan.dto.request.ChangePasswordRequest;
import vn.doan.dto.request.UserCreateRequest;
import vn.doan.dto.response.UserResponse;
import vn.doan.exception.BusinessValidationException;
import vn.doan.repository.BaristaRepository;
import vn.doan.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private BaristaRepository baristaRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, baristaRepository, passwordEncoder);
    }

    @Test
    void createsStaffWithBaristaContactDetails() {
        UserCreateRequest request = new UserCreateRequest(
                "barista", "password", "barista@example.com", "BARISTA", "0900000000", null);
        when(userRepository.existsByUsername("barista")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("hashed-password");
        when(baristaRepository.save(any(Barista.class))).thenAnswer(invocation -> {
            Barista barista = invocation.getArgument(0);
            barista.setId("BARISTA_1");
            return barista;
        });
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.createStaff(request);

        assertEquals("BARISTA_1", response.getBaristaId());
        assertEquals("barista", response.getFullName());
        assertEquals("0900000000", response.getPhone());
    }

    @Test
    void changesPasswordAfterVerifyingCurrentPassword() {
        User user = new User();
        user.setHashPassword("old-hash");
        when(userRepository.findById("USER_1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        userService.changePassword("USER_1", request("current-password", "new-password"));

        assertEquals("new-hash", user.getHashPassword());
    }

    @Test
    void rejectsWrongCurrentPasswordWithoutChangingStoredHash() {
        User user = new User();
        user.setHashPassword("old-hash");
        when(userRepository.findById("USER_1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "old-hash")).thenReturn(false);

        assertThrows(
                BusinessValidationException.class,
                () -> userService.changePassword("USER_1", request("wrong-password", "new-password"))
        );

        assertEquals("old-hash", user.getHashPassword());
        verify(passwordEncoder, never()).encode(anyString());
    }

    private ChangePasswordRequest request(String currentPassword, String newPassword) {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword(currentPassword);
        request.setNewPassword(newPassword);
        return request;
    }
}
