package com.clinicgo.patient.models;

public class ChatMessage {
    private int messageId;
    private int senderId;
    private String senderName;
    private int receiverId;
    private int appointmentId;
    private String content;
    private String sentAt;
    private boolean isRead;

    public ChatMessage() {}

    // For sending (outgoing)
    public ChatMessage(int senderId, int receiverId, int appointmentId, String content) {
        this.senderId      = senderId;
        this.receiverId    = receiverId;
        this.appointmentId = appointmentId;
        this.content       = content;
    }

    public int     getMessageId()     { return messageId; }
    public int     getSenderId()      { return senderId; }
    public String  getSenderName()    { return senderName; }
    public int     getReceiverId()    { return receiverId; }
    public int     getAppointmentId() { return appointmentId; }
    public String  getContent()       { return content; }
    public String  getSentAt()        { return sentAt; }
    public boolean isRead()           { return isRead; }

    public void setMessageId(int v)      { messageId = v; }
    public void setSenderId(int v)       { senderId = v; }
    public void setSenderName(String v)  { senderName = v; }
    public void setReceiverId(int v)     { receiverId = v; }
    public void setAppointmentId(int v)  { appointmentId = v; }
    public void setContent(String v)     { content = v; }
    public void setSentAt(String v)      { sentAt = v; }
    public void setRead(boolean v)       { isRead = v; }
}
