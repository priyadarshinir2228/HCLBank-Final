package com.HCLBank.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "customer_kyc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerKyc {

    @Id
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "address_1")
    private String address1;

    @Column(name = "address_2")
    private String address2;

    @Column(name = "mail_id")
    private String mailId;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "notes")
    private String notes;

    @OneToOne
    @MapsId
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

