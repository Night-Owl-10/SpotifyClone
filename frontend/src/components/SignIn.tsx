import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { signIn, signInWithGoogle } from "@/services/authService";
import { toast } from "sonner";

interface SignInProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignUp?: () => void;
}

function SignIn({ open, onOpenChange, onSwitchToSignUp }: SignInProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Sign In:", { email, password });

        try {
            await signIn(email, password);

            toast.success("Signed in");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Error signing in");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#121212] border border-zinc-700 text-white sm:max-w-md rounded-2xl shadow-2xl p-8">
                <DialogHeader className="mb-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-8 bg-[#1db954] rounded-full flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white">Sign In</DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Please enter your credentials to sign in.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="signin-email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className="pl-9 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus-visible:ring-[#1db954] focus-visible:border-[#1db954] rounded-lg h-11"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-9 pr-10 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus-visible:ring-[#1db954] focus-visible:border-[#1db954] rounded-lg h-11"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                        <Button
                            type="submit"
                            className="flex-1 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold rounded-full h-11 text-base transition-all duration-200"
                        >
                            Sign In
                        </Button>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-zinc-600 text-white bg-transparent hover:bg-zinc-700 hover:text-white rounded-full h-11 text-base"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                    </div>
                </form>

                {/* OR divider */}
                <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-zinc-700" />
                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-zinc-700" />
                </div>

                {/* Continue with Google */}
                <button
                    id="signin-google-btn"
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-full h-11 text-sm transition-colors duration-200 border border-zinc-300"
                >
                    {/* Google "G" SVG logo */}
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                {onSwitchToSignUp && (
                    <p className="text-center text-zinc-400 text-sm mt-4">
                        Don't have an account?{" "}
                        <button
                            onClick={() => { onOpenChange(false); onSwitchToSignUp(); }}
                            className="text-[#1db954] hover:underline font-semibold"
                        >
                            Sign Up
                        </button>
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default SignIn;
