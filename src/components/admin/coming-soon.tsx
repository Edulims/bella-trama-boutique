import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  title: string;
  description: string;
  features: string[];
}

export function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="p-8 max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="text-stone-500 mb-6 -ml-3">
        <Link href="/admin">
          <ArrowLeft size={14} />
          Voltar ao Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <Badge
          variant="outline"
          className="bg-ai-purple-50 text-ai-purple-700 border-ai-purple-100 text-[10px] uppercase tracking-wider font-semibold mb-3"
        >
          <Sparkles size={10} className="mr-1" />
          Em desenvolvimento
        </Badge>
        <h2 className="font-serif text-3xl text-stone-900 tracking-tight">{title}</h2>
        <p className="text-stone-500 text-sm mt-1.5">{description}</p>
      </div>

      <Card className="border-stone-200/80 shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            O que virá nesta tela
          </p>
          <ul className="space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-stone-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-rose-700 mt-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
