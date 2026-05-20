import { useDeferredValue, useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { getEmailLogs } from "../../services/adminService";
import { formatDateTime } from "../../utils/formatters";

function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      const data = await getEmailLogs({ search: deferredSearch, ...filters });
      setLogs(data);
      setLoading(false);
    };

    loadLogs();
  }, [deferredSearch, filters]);

  const columns = useMemo(
    () => [
      { header: "Recipient", cell: ({ row }) => row.original.recipient },
      {
        header: "Type",
        cell: ({ row }) => <StatusBadge status={row.original.type} />,
      },
      { header: "Subject", cell: ({ row }) => row.original.subject },
      {
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: "Sent At",
        cell: ({ row }) => formatDateTime(row.original.sentAt),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search recipients or email subjects..."
        filters={[
          {
            name: "type",
            label: "Email Type",
            value: filters.type,
            onChange: (value) => setFilters((current) => ({ ...current, type: value })),
            options: [
              { value: "welcome", label: "Welcome" },
              { value: "kyc_update", label: "KYC Update" },
              { value: "funding", label: "Funding" },
              { value: "partner_review", label: "Partner Review" },
              { value: "distribution", label: "Distribution" },
              { value: "reminder", label: "Reminder" },
            ],
          },
          {
            name: "status",
            label: "Delivery Status",
            value: filters.status,
            onChange: (value) =>
              setFilters((current) => ({ ...current, status: value })),
            options: [
              { value: "draft", label: "Draft" },
              { value: "queued", label: "Queued" },
              { value: "sent", label: "Sent" },
              { value: "failed", label: "Failed" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setFilters({ type: "", status: "" });
        }}
      />

      <DataTable columns={columns} data={logs} loading={loading} pageSize={8} />
    </div>
  );
}

export default EmailLogsPage;
