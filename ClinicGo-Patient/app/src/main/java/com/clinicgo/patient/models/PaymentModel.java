package com.clinicgo.patient.models;
public class PaymentModel {
    public int     paymentId;
    public int     appointmentId;
    public double  amount;
    public String  method;
    public String  status;
    public String  transactionRef;
    public String  paidAt;
    public String  refundedAt;
}
