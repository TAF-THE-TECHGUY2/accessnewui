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
  // The types the log actually contains. The options here used to be a fixed
  // list left over from the mock data ("welcome", "funding", ...), none of
  // which match what the app writes, so every choice filtered to nothing.
  const [knownTypes, setKnownTypes] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      const data = await getEmailLogs({ search: deferredSearch, ...filters });
      setLogs(data);
      // Only an unfiltered response sees every type, so the list is collected
      // then and kept while the admin narrows it down.
      if (!filters.type && !filters.status && !deferredSearch) {
        setKnownTypes([...new Set(data.map((log) => log.type))].sort());
      }
      setLoading(false);
    };

    loadLogs();
  }, [deferredSearch, filters]);

  const typeOptions = useMemo(
    () =>
      knownTypes.map((type) => ({
        value: type,
        label: type
          .replace(/_/g, " ")
          .replace(/^./, (c) => c.toUpperCase()),
      })),
    [knownTypes],
  );

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
            options: typeOptions,
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
