import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/store/authStore";
import { useModalStore } from "@/store/modalStore";

interface ActivitySectionConfig {
  title: string;
  description: string;
  endpoint: string;
  emptyText: string;
}

interface ActivitySectionData extends ActivitySectionConfig {
  items: any[];
  error?: string;
}

const getActivitySections = (role?: string): ActivitySectionConfig[] => {
  switch (role) {
    case "BUYER":
      return [
        {
          title: "My Purchases",
          description: "Track sale orders, pickup codes, payment, and delivery.",
          endpoint: API_ENDPOINTS.orders.purchases,
          emptyText: "You have not placed any orders yet.",
        },
      ];
    case "DONOR_SELLER":
      return [
        {
          title: "My Sales",
          description: "Follow buyer orders for your sale listings.",
          endpoint: API_ENDPOINTS.orders.sales,
          emptyText: "You have no sale orders yet.",
        },
        {
          title: "Donation Offers",
          description: "Track charity claims for your donation listings.",
          endpoint: API_ENDPOINTS.donations.myOffers,
          emptyText: "No charity has claimed your donations yet.",
        },
      ];
    case "CHARITY_ORG":
      return [
        {
          title: "Donation Claims",
          description: "Track claimed donations and pickup codes.",
          endpoint: API_ENDPOINTS.donations.myClaims,
          emptyText: "You have not claimed any donations yet.",
        },
      ];
    case "INDEP_DELIVERY":
      return [
        {
          title: "Assigned Deliveries",
          description: "Track assigned buyer order deliveries.",
          endpoint: API_ENDPOINTS.orders.deliveries,
          emptyText: "You have no assigned deliveries yet.",
        },
      ];
    case "ORG_VOLUNTEER":
      return [
        {
          title: "Donation Deliveries",
          description: "Track donation pickups assigned to you.",
          endpoint: API_ENDPOINTS.donations.myDeliveries,
          emptyText: "You have no assigned donation deliveries yet.",
        },
      ];
    default:
      return [];
  }
};

const getStatus = (item: any) =>
  item.OrderStatus ||
  item.ClaimStatus ||
  item.DeliveryStatus ||
  item.delivery?.DeliveryStatus ||
  item.order?.OrderStatus ||
  item.claim?.ClaimStatus ||
  "PENDING";

const getTitle = (item: any) =>
  item.listing?.Title ||
  item.order?.listing?.Title ||
  item.claim?.listing?.Title ||
  "Food item";

const getIdLabel = (item: any) => {
  if (item.OrderID) return `Order #${item.OrderID}`;
  if (item.ClaimID) return `Claim #${item.ClaimID}`;
  if (item.DeliveryID) return `Delivery #${item.DeliveryID}`;
  if (item.order?.OrderID) return `Order #${item.order.OrderID}`;
  if (item.claim?.ClaimID) return `Claim #${item.claim.ClaimID}`;
  return "Activity";
};

const getPickupCode = (item: any) =>
  item.PickupCode || item.pickupCode || item.order?.PickupCode || item.claim?.PickupCode;

const getMoney = (item: any) => {
  const total = Number(item.FinalPrice ?? item.order?.FinalPrice ?? 0) +
    Number(item.DeliveryFee ?? item.order?.DeliveryFee ?? 0);
  return total > 0 ? `Tk ${total}` : null;
};

const getOrderId = (item: any) => item.OrderID || item.order?.OrderID;

const getClaimId = (item: any) => item.ClaimID || item.claim?.ClaimID;

const getDeliveryStatus = (item: any) =>
  item.DeliveryStatus ||
  item.delivery?.DeliveryStatus ||
  item.order?.delivery?.DeliveryStatus ||
  item.claim?.delivery?.DeliveryStatus;

const ActivityPage: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const userRole = useAuthStore((state) => state.user?.role);
  const openModal = useModalStore((state) => state.openModal);
  const sections = useMemo(() => getActivitySections(userRole), [userRole]);
  const [activityData, setActivityData] = useState<ActivitySectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActivity = async () => {
      if (!token || sections.length === 0) {
        setActivityData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const results = await Promise.all(
        sections.map(async (section) => {
          try {
            const response = await axios.get(
              `${API_CONFIG.baseURL}${section.endpoint}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
              ...section,
              items: response.data?.data || [],
            };
          } catch (error) {
            const message = axios.isAxiosError(error)
              ? error.response?.data?.message || "Could not load this activity."
              : "Could not load this activity.";

            return {
              ...section,
              items: [],
              error: message,
            };
          }
        })
      );

      if (isMounted) {
        setActivityData(results);
        setIsLoading(false);
      }
    };

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [sections, token]);

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-dark-text">
              My Activity
            </h1>
            <p className="mt-2 text-dark-text/70">
              Follow your orders, donation claims, deliveries, and pickup codes.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/foods">Browse listings</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-dark-text/70">
            Loading activity...
          </div>
        ) : activityData.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-dark-text/70">
            This role does not have activity tracking yet.
          </div>
        ) : (
          <div className="space-y-6">
            {activityData.map((section) => (
              <section
                key={section.endpoint}
                className="rounded-lg border border-dark-text/10 bg-white p-4 shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-dark-text">
                    {section.title}
                  </h2>
                  <p className="text-sm text-dark-text/65">
                    {section.description}
                  </p>
                </div>

                {section.error ? (
                  <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {section.error}
                  </p>
                ) : section.items.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-sm text-dark-text/65">
                    {section.emptyText}
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {section.items.map((item) => {
                      const pickupCode = getPickupCode(item);
                      const money = getMoney(item);
                      const status = getStatus(item);
                      const deliveryStatus = getDeliveryStatus(item);
                      const orderId = getOrderId(item);
                      const claimId = getClaimId(item);
                      const canAuthorizePickup =
                        userRole === "DONOR_SELLER" &&
                        status === "PENDING" &&
                        (orderId || claimId);
                      const canCompleteOrder =
                        userRole === "BUYER" &&
                        orderId &&
                        deliveryStatus === "IN_TRANSIT";
                      const canCompleteClaim =
                        (userRole === "CHARITY_ORG" ||
                          userRole === "ORG_VOLUNTEER") &&
                        claimId &&
                        deliveryStatus === "IN_TRANSIT";
                      const showRiderCompletionHint =
                        userRole === "INDEP_DELIVERY" &&
                        orderId &&
                        deliveryStatus === "IN_TRANSIT";

                      return (
                        <article
                          key={`${getIdLabel(item)}-${getTitle(item)}`}
                          className="rounded-md border border-dark-text/10 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-brand-green">
                                {getIdLabel(item)}
                              </p>
                              <h3 className="text-lg font-semibold text-dark-text">
                                {getTitle(item)}
                              </h3>
                            </div>
                            <Badge className="w-fit bg-brand-green text-white">
                              {status}
                            </Badge>
                          </div>
                          <div className="mt-3 grid gap-2 text-sm text-dark-text/70 sm:grid-cols-3">
                            {money && <p>Total: {money}</p>}
                            {item.DeliveryType || item.order?.DeliveryType || item.claim?.DeliveryType ? (
                              <p>
                                Delivery:{" "}
                                {item.DeliveryType ||
                                  item.order?.DeliveryType ||
                                  item.claim?.DeliveryType}
                              </p>
                            ) : null}
                            {pickupCode && (
                              <p className="font-semibold text-dark-text">
                                Pickup code: {pickupCode}
                              </p>
                            )}
                          </div>
                          {showRiderCompletionHint && (
                            <p className="mt-4 rounded-md bg-brand-green/5 p-3 text-sm text-dark-text/70">
                              Delivery is in transit. The buyer confirms final
                              completion after receiving the food.
                            </p>
                          )}
                          {(canAuthorizePickup ||
                            canCompleteOrder ||
                            canCompleteClaim) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {canAuthorizePickup && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    openModal("AUTHORIZE_PICKUP", {
                                      orderId: orderId || undefined,
                                      claimId: claimId || undefined,
                                    })
                                  }
                                >
                                  Authorize Pickup
                                </Button>
                              )}
                              {canCompleteOrder && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    openModal("COMPLETE_DELIVERY", { orderId })
                                  }
                                >
                                  Complete Delivery
                                </Button>
                              )}
                              {canCompleteClaim && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    openModal("COMPLETE_DELIVERY", { claimId })
                                  }
                                >
                                  Complete Donation
                                </Button>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
