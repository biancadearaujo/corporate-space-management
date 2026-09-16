import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RecoveryFormProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function RecoveryForm({ className, ...props }: RecoveryFormProps) {
    return (
        <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl text-black">
                        Redefinir senha
                    </CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                    <form className="w-full">
                        <div className="grid gap-6">
                            <div className="grid gap-3 text-verde-t2m">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="João@email.com"
                                    required
                                    className="w-full" // O input ocupa toda a largura do container
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-verde-t2m hover:bg-verde-hover"
                            >
                                Enviar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
