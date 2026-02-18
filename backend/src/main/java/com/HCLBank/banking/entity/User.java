package com.HCLBank.banking.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", unique = true, nullable = false)
    private String userName;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(unique = true)
    private String upiId;

    private boolean kycCompleted;

    @Column(name = "user_pwd", nullable = false)
    private String userPwd;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
