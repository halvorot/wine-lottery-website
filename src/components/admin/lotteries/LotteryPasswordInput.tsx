
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LotteryPasswordInputProps {
  password: string;
  onPasswordChange: (password: string) => void;
}

export function LotteryPasswordInput({ password, onPasswordChange }: LotteryPasswordInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Lottery Password</Label>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="Enter lottery password"
        required
      />
    </div>
  );
}
