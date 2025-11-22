import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Plus,
  Search,
  Filter,
} from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  is_enabled: boolean;
  requires_credentials: boolean;
  credentials_status: "not_configured" | "sandbox" | "production";
  rollout_percentage: number;
  allowed_roles: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  verification: "Vérifications",
  signature: "Signature",
  payment: "Paiements",
  notification: "Notifications",
  ai: "Intelligence Artificielle",
  map: "Carte",
  agency: "Agences",
  maintenance: "Maintenance",
  analytics: "Analytics",
  moderation: "Modération",
  advanced: "Avancé",
};

const CATEGORY_COLORS: Record<string, string> = {
  verification: "bg-blue-100 text-blue-800",
  signature: "bg-purple-100 text-purple-800",
  payment: "bg-green-100 text-green-800",
  notification: "bg-yellow-100 text-yellow-800",
  ai: "bg-pink-100 text-pink-800",
  map: "bg-indigo-100 text-indigo-800",
  agency: "bg-orange-100 text-orange-800",
  maintenance: "bg-teal-100 text-teal-800",
  analytics: "bg-cyan-100 text-cyan-800",
  moderation: "bg-red-100 text-red-800",
  advanced: "bg-gray-100 text-gray-800",
};

export default function AdminFeatureFlags() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // Récupérer tous les feature flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ["feature-flags", selectedCategory],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const url = selectedCategory === "all"
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-feature-flags`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-feature-flags?category=${selectedCategory}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch feature flags");

      const result = await response.json();
      return result.flags as FeatureFlag[];
    },
  });

  // Mutation pour toggle un flag
  const toggleFlagMutation = useMutation({
    mutationFn: async (flagKey: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-feature-flags/${flagKey}/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to toggle feature flag");

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Feature flag mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Filtrer les flags selon la recherche
  const filteredFlags = flags?.filter((flag) =>
    flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouper les flags par catégorie
  const flagsByCategory = filteredFlags?.reduce((acc, flag) => {
    if (!acc[flag.category]) {
      acc[flag.category] = [];
    }
    acc[flag.category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  // Statistiques
  const stats = {
    total: flags?.length || 0,
    enabled: flags?.filter((f) => f.is_enabled).length || 0,
    needsCredentials: flags?.filter((f) => f.requires_credentials && f.credentials_status === "not_configured").length || 0,
    sandbox: flags?.filter((f) => f.credentials_status === "sandbox").length || 0,
    production: flags?.filter((f) => f.credentials_status === "production").length || 0,
  };

  const getCredentialsStatusBadge = (status: string) => {
    switch (status) {
      case "production":
        return <Badge className="bg-green-100 text-green-800">Production</Badge>;
      case "sandbox":
        return <Badge className="bg-yellow-100 text-yellow-800">Sandbox</Badge>;
      case "not_configured":
        return <Badge className="bg-red-100 text-red-800">Non configuré</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="h-8 w-8" />
            Gestion des Feature Flags
          </h1>
          <p className="text-muted-foreground mt-2">
            Activez ou désactivez les fonctionnalités de la plateforme sans redéployer
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Besoin Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.needsCredentials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sandbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.sandbox}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.production}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une fonctionnalité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des feature flags par catégorie */}
      <div className="space-y-6">
        {flagsByCategory && Object.entries(flagsByCategory).map(([category, categoryFlags]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800"}>
                  {CATEGORY_LABELS[category] || category}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  ({categoryFlags.length} fonctionnalités)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonctionnalité</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Credentials</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-center">Activée</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{flag.name}</div>
                          <div className="text-xs text-muted-foreground">{flag.key}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {flag.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {flag.requires_credentials ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getCredentialsStatusBadge(flag.credentials_status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={flag.is_enabled}
                          onCheckedChange={() => toggleFlagMutation.mutate(flag.key)}
                          disabled={
                            flag.requires_credentials &&
                            flag.credentials_status === "not_configured"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowHistory(true);
                          }}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Historique */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historique: {selectedFlag?.name}</DialogTitle>
            <DialogDescription>
              Historique des modifications de ce feature flag
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Fonctionnalité à implémenter: Affichage de l'historique des changements
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

