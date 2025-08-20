# 🍔 Food Delivery System

**Food Delivery System** is a modern, distributed web application that allows users to order food from multiple restaurants, track orders in real-time, and manage payments. The system is designed using a **microservices architecture** with an **API Gateway** to handle client requests efficiently.

---

## 🚀 Features

- 🛒 **Browse & Order Food**: Users can browse restaurants, view menus, and place orders.  
- 📦 **Order Management**: Track order status from preparation to delivery.  
- 🔐 **Authentication & Authorization**: Secure user login and registration.  
- 💳 **Payment Integration**: Support for multiple payment gateways.  
- 🌐 **Distributed Architecture**: Backend divided into multiple independent services.  
- 🔗 **API Gateway**: Single entry point for client requests, routing to appropriate services.  
- 📡 **Real-time Notifications**: Updates on order status and delivery.  

---

## 🏗️ Architecture Overview

The system is built using a **microservices-based architecture** with the following services:

1. **User Service**  
   - Handles user authentication, registration, and profile management.  

2. **Restaurant Service**  
   - Manages restaurants, menus, and food items.  

3. **Order Service**  
   - Manages order creation, tracking, and history.  

4. **Payment Service**  
   - Handles payment processing and transaction history.  

5. **Delivery Service**  
   - Manages delivery personnel, tracking, and route optimization.  

6. **API Gateway**  
   - Routes client requests to the correct microservice.  
   - Handles authentication, rate-limiting, and load balancing.  

**Architecture Diagram:**

         +-------------------+
        |      Client       |
        +-------------------+
                 |
                 v
        +-------------------+
        |    API Gateway    |
        +-------------------+
         |       |       |
         v       v       v
   User Svc   Order Svc  Restaurant Svc
         |       |       |
      Payment Svc  Delivery Svc

