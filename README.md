# Buy-Sell Website
The website is built using the MERN stack:

* MongoDB for the database
* Express.js for the backend 
* React.js for the frontend
* Node.js for server-side scripting

## Features

1. User Registration and Authentication
Users must register using their IIIT emails.
Passwords are stored securely using hashing (bcrypt.js).
All pages require authentication; unauthorized access redirects to the login page.
Implemented Google Recaptcha or LibreCaptcha for bot prevention.

2. A Navbar with links to all major pages (Profile, My Cart, Orders, etc.).
Profile page showing and allowing edits of the user’s details (Name, Email, etc.).
Option to log out, keeping users logged in between sessions unless they log out explicitly.
3. Item Search and Filtering
Search bar for users to find items by name (case-insensitive).
Filters based on categories (clothing, grocery, etc.) to narrow down results.
Displays all items if no search/filter is provided.
4. Item Pages
Each item has a dedicated page displaying its name, price, description, and seller information.
Users can add items to their cart directly from this page.
5. My Cart
Users can view all items added to their cart.
Items are displayed with their name, price, and an option to remove them.
Total cost of all items is shown.
Final Order button to place an order for all items in the cart.
Items in the cart should be from different sellers (buyers cannot purchase from themselves).
6. Orders History
A page displaying all orders placed by the user (as a buyer or seller).
Divided into tabs for pending orders, past orders, and sold items.
Each pending order shows a randomly generated OTP, which is used to close the transaction.
7. Deliver Items (Seller's Page)
Displays orders to be delivered by the seller.
Each item shows its name, price, and the buyer who placed the order.
Seller enters the OTP provided by the buyer to close the transaction. Incorrect OTP displays an error.
8. Transaction and OTP Management
Upon placing an order, a randomly generated OTP is provided to the buyer.
OTPs are stored in a hashed form in the database.
Sellers can close the transaction by entering the correct OTP.
10. Bonus Features
ChatBot Integration: An automated chatbot powered by AI models (I used Gemini) to assist users with their queries. The chatbot features a session-based chat UI, similar to support chats in apps like Swiggy.
Tech Stack

