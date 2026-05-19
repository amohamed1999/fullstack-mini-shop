import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  Eye,
  FileText,
  User,
  Calendar,
  Layers,
  ArrowDownWideNarrow,
  Copy,
  Check,
  Printer,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";

import {
  mergeOrderUpdate,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/features/orders/types";
import {
  useOrders,
  useUpdateOrderStatus,
} from "@/features/orders/use-orders";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Atlas" }] }),
  component: OrdersPage,
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function normalizeOrderStatus(status: string): OrderStatus {
  const lower = status.toLowerCase();
  if (lower === "completed") return "delivered";
  if (ORDER_STATUSES.includes(lower as OrderStatus)) {
    return lower as OrderStatus;
  }
  return "pending";
}

function getStatusBadge(status: string) {
  const normalized = normalizeOrderStatus(status);
  switch (normalized) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          {STATUS_LABELS.pending}
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
          {STATUS_LABELS.processing}
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
          {STATUS_LABELS.shipped}
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {STATUS_LABELS.delivered}
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          <span className="size-1.5 rounded-full bg-destructive" />
          {STATUS_LABELS.cancelled}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border">
          <span className="size-1.5 rounded-full bg-muted-foreground" />
          {status}
        </span>
      );
  }
}

function OrderStatusSelect({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (order: Order) => void;
}) {
  const { mutate, isPending } = useUpdateOrderStatus();
  const normalized = normalizeOrderStatus(order.status);

  const handleChange = (value: string) => {
    const status = value as OrderStatus;
    if (status === normalized) return;

    mutate(
      { orderId: order.id, status },
      {
        onSuccess: (updatedOrder) => {
          onUpdated(mergeOrderUpdate(order, updatedOrder));
          toast.success(`Order status updated to ${STATUS_LABELS[status]}`);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update order status",
          );
        },
      },
    );
  };

  return (
    <Select
      value={normalized}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-[150px] bg-background text-xs font-semibold">
        {isPending ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" />
            Updating...
          </span>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OrdersPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useOrders();
  const orders = data?.items ?? [];

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // KPI Calculations (based on all actual fetched data)
  const totalOrders = orders.length;
  const totalSales = orders
    .filter((o) => o.status.toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status.toLowerCase() === "pending",
  ).length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Search, filter, and sort handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("date-desc");
    setCurrentPage(1);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.profiles.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_items.some((item) =>
        item.products.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" ||
      normalizeOrderStatus(order.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorted orders list
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date-asc":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "amount-desc":
        return b.total_amount - a.total_amount;
      case "amount-asc":
        return a.total_amount - b.total_amount;
      default:
        return 0;
    }
  });

  // Paginated orders list
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const statuses = [
    { value: "all", label: "All Orders", count: orders.length },
    ...ORDER_STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      count: orders.filter((o) => normalizeOrderStatus(o.status) === status)
        .length,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor transaction records, print invoices, and manage customer checkouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Syncing..." : "Sync Orders"}
          </Button>
        </div>
      </header>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error loading orders</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "We could not connect to the orders database."}
          </AlertDescription>
        </Alert>
      )}

      {/* SKELETON LOADER */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* POPULATED PAGE */}
      {!isLoading && !isError && (
        <>
          {/* KPI Dashboard Stats */}
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Order Metrics Dashboard"
          >
            {/* Sales Volume */}
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales Volume
                </CardTitle>
                <div className="grid size-8 place-items-center rounded-md bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">
                  {formatPrice(totalSales)}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <TrendingUp className="size-3" />
                  Active Gross Sales
                </p>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-primary to-primary-glow opacity-15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Order Count
                </CardTitle>
                <div className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <ShoppingCart className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">
                  {totalOrders}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lifetime processed transactions
                </p>
              </CardContent>
            </Card>

            {/* Pending Checkouts */}
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Checkouts
                </CardTitle>
                <div className="grid size-8 place-items-center rounded-md bg-amber-500/10 text-amber-500 relative">
                  {pendingOrdersCount > 0 && (
                    <span className="absolute top-0 right-0 size-2.5 rounded-full bg-amber-500 border-2 border-background animate-pulse" />
                  )}
                  <Clock className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">
                  {pendingOrdersCount}
                </div>
                <p className="mt-1 text-xs text-amber-500 font-medium animate-pulse">
                  Awaiting payment / packing
                </p>
              </CardContent>
            </Card>

            {/* Average Ticket Size */}
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
                <div className="grid size-8 place-items-center rounded-md bg-blue-500/10 text-blue-500">
                  <ArrowUpRight className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">
                  {formatPrice(averageOrderValue)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Average amount spent per checkout
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Interactive Filters Bar */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm shadow-sm border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, order ID, or product name..."
                  className="pl-9 w-full bg-background"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Toolbar Dropdowns & Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status select (responsive view) */}
                <div className="hidden sm:flex border rounded-lg bg-background p-0.5">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusFilterChange(status.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        statusFilter === status.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {status.label}
                      {status.count > 0 && (
                        <span
                          className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                            statusFilter === status.value
                              ? "bg-primary-foreground text-primary"
                              : "bg-muted text-muted-foreground group-hover:bg-background"
                          }`}
                        >
                          {status.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Mobile status select */}
                <div className="sm:hidden w-full">
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Status Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label} ({status.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[170px] bg-background">
                      <div className="flex items-center gap-2">
                        <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Sort Orders" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="amount-desc">
                        Highest Value
                      </SelectItem>
                      <SelectItem value="amount-asc">Lowest Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear filters */}
                {(searchQuery !== "" ||
                  statusFilter !== "all" ||
                  sortBy !== "date-desc") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2 text-xs font-semibold cursor-pointer hover:bg-destructive/10 hover:text-destructive text-muted-foreground gap-1.5"
                  >
                    <FilterX className="size-3.5" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* TABLE PANEL */}
          {sortedOrders.length === 0 ? (
            <div className="grid min-h-[300px] place-items-center rounded-xl border-2 border-dashed bg-muted/10 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-muted">
                  <FilterX className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  No matching orders
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Try adjusting your search terms, changing the status filter,
                  or resetting criteria.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer mt-2"
                >
                  Reset all filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden shadow-sm border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="w-[140px]">Order ID</TableHead>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="hidden md:table-cell max-w-[250px]">
                            Items Purchased
                          </TableHead>
                          <TableHead className="text-right">
                            Total Price
                          </TableHead>
                          <TableHead className="text-right">Status</TableHead>
                          <TableHead className="w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOrders.map((order) => {
                          const itemSummary = order.order_items
                            .map(
                              (item) =>
                                `${item.products.name} (x${item.quantity})`,
                            )
                            .join(", ");

                          return (
                            <TableRow
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className="group cursor-pointer hover:bg-muted/40 transition-colors"
                            >
                              {/* Order ID */}
                              <TableCell className="font-mono text-xs font-semibold text-primary">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">
                                    #
                                  </span>
                                  <span className="truncate w-16 inline-block">
                                    {order.id.slice(0, 8)}
                                  </span>
                                  <CopyButton text={order.id} />
                                </div>
                              </TableCell>

                              {/* Date */}
                              <TableCell className="text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="size-3.5 text-muted-foreground/60" />
                                  {formatDate(order.created_at)}
                                </div>
                              </TableCell>

                              {/* Customer */}
                              <TableCell className="font-medium text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                    {order.profiles.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                  <span>{order.profiles.name}</span>
                                </div>
                              </TableCell>

                              {/* Items Purchased */}
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[250px] truncate">
                                <div className="flex items-center gap-1.5">
                                  <Layers className="size-3.5 text-muted-foreground/60 shrink-0" />
                                  <span className="truncate">
                                    {itemSummary}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Total Price */}
                              <TableCell className="text-right font-semibold text-sm">
                                {formatPrice(order.total_amount)}
                              </TableCell>

                              {/* Status */}
                              <TableCell className="text-right">
                                {getStatusBadge(order.status)}
                              </TableCell>

                              {/* View invoice */}
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOrder(order);
                                    }}
                                    className="h-8 px-2 opacity-80 group-hover:opacity-100 transition-opacity gap-1 text-xs cursor-pointer hover:bg-primary/10 hover:text-primary"
                                  >
                                    <Eye className="size-3.5" />
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-2">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        sortedOrders.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{sortedOrders.length}</span>{" "}
                    orders
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="size-8 cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <div className="text-xs font-semibold px-3 py-1 rounded bg-muted/60">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="size-8 cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DETAIL INVOICE DIALOG */}
      <Dialog
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-card p-0 overflow-hidden shadow-2xl border">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }
              #printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                padding: 24px !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `,
            }}
          />

          {selectedOrder && (
            <div id="printable-invoice" className="flex flex-col">
              {/* Receipt Branding Top */}
              <div className="p-6 bg-muted/30 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold tracking-wider text-lg bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      ATLAS
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Official Invoice
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice ID: {selectedOrder.id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  {getStatusBadge(selectedOrder.status)}
                  <OrderStatusSelect
                    order={selectedOrder}
                    onUpdated={setSelectedOrder}
                  />
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border-b text-sm">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Billed To
                  </h4>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground" />
                      {selectedOrder.profiles.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground/80">
                      User ID: {selectedOrder.user_id}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Payment & Date
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Ordered on {formatDate(selectedOrder.created_at)}
                    </p>
                    <p className="text-muted-foreground">
                      Method: <span className="font-semibold text-foreground">Digital Wallet / Card</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Breakdown
                </h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-sm">
                            {item.products.name}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatPrice(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatPrice(item.unit_price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total Calculation Panel */}
              <div className="bg-muted/30 p-6 border-t mt-auto flex flex-col items-end gap-2">
                <div className="w-full sm:w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping & Handling</span>
                    <span className="text-emerald-500 font-semibold">Free</span>
                  </div>
                  <Separator className="my-1.5" />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Grand Total</span>
                    <span className="text-primary font-display">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="p-4 border-t flex items-center justify-between bg-card gap-3 print:hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ID: {selectedOrder.id.slice(0, 18)}...
                  </span>
                  <CopyButton text={selectedOrder.id} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1.5 cursor-pointer hover:bg-muted text-xs font-semibold"
                  >
                    <Printer className="size-3.5" />
                    Print Invoice
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Close Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
