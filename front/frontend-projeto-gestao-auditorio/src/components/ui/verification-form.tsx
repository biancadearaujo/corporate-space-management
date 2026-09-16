'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';

export function VerificationForm() {
    const [timeLeft, setTimeLeft] = useState(120);
    const [otp, setOtp] = useState('');

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendCode = () => {
        setTimeLeft(120);
    };

    const handleVerify = () => {
        console.log('Verificando código:', otp);
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                    Verificação de código
                </CardTitle>
                <CardDescription className="text-center">
                    Enviamos um código de recuperação para o seu e-mail
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        containerClassName="gap-3"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>

                    <div className="text-center text-sm text-muted-foreground">
                        {timeLeft > 0 ? (
                            <p>
                                Tempo restante:{' '}
                                <span className="font-medium">
                                    {formatTime(timeLeft)}
                                </span>
                            </p>
                        ) : (
                            <p>Tempo esgotado</p>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleVerify}
                    className="w-full bg-verde-t2m hover:bg-verde-t2m/90"
                    disabled={otp.length < 6}
                >
                    Verificar
                </Button>

                <div className="text-center">
                    <Button
                        variant="link"
                        onClick={handleResendCode}
                        disabled={timeLeft > 0}
                        className={
                            timeLeft > 0
                                ? 'text-muted-foreground'
                                : 'text-verde-t2m'
                        }
                    >
                        Reenviar código
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
