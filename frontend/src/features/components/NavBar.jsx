import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../Styles/NavBar.css"

export default function NavBar() {
    const { isSignedIn, isLoaded } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav>
            <h1>My Application</h1>
            <ul>
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
            </ul>
            {!isLoaded ? (<div>...Loading</div>) : isSignedIn ? (
                <UserButton appearance={{
                    elements: {
                        avatarBox: "w-8 h-8"
                    }
                }}
                afterSignOutUrl="/"/>
            ) : (
                <SignInButton  mode="modal"><button>SignIn</button></SignInButton>
            )}
        </nav>
    );
}