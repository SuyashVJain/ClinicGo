package com.clinicgo.staff.models;
import java.util.List;
public class QueueModel {
    public int    doctorId;
    public String date;
    public int    total;
    public int    completed;
    public int    inProgress;
    public int    waiting;
    public int    noShow;
    public List<AppointmentModel> queue;
}
