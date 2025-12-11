import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login"
import ProfileView from "./components/ProfileView";
import ProductsView from "./components/ProductsView";
import AddProductView from "./components/AddProductView";
import EditProductView from "./components/EditProductView";
import CartView from "./components/CartView";
import CreateAccountView from "./components/CreateAccountView";
import EditProfileView from "./components/EditProfileView";
import { UserProvider } from "./components/UserContext";
function App() {
    return(
        <>
        <Router
				future={{
					v7_startTransition: true,
				}}>
        <div className="container">
                <UserProvider>
                <Routes>
                    <Route
                    path="/"
                    element={<Login/>}
                    />
                    <Route
                    path="/createAccount"
                    element={<CreateAccountView/>}
                    />
                    <Route
                    path="/profile"
                    element={<ProfileView/>}
                    />
                    <Route
                    path="/products"
                    element={<ProductsView/>}
                    />
                    <Route
                    path="/addProduct"
                    element={<AddProductView/>}
                    />
                    <Route
                    path="/editProduct/:id"
                    element={<EditProductView/>}
                    />
                    <Route
                    path="/editProfile"
                    element={<EditProfileView/>}
                    />
                     <Route
                    path="/cart"
                    element={<CartView/>}
                    />
                </Routes>
                </UserProvider>
        </div>
     </Router>
    </>
    );
}

export default App;
