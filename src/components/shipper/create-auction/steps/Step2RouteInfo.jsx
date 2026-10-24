import RoutePointCard from "./route/RoutePointCard";
import RouteRoadPreviewCard from "./route/RouteRoadPreviewCard";
import TimeWindowCard from "./route/TimeWindowCard";
import { ROUTE_POINTS } from "./route/routePointConfig";
import { useSaveToAddressBook } from "./route/useSaveToAddressBook";

export default function Step2RouteInfo({ form, updateForm, onOpenAddressBook }) {
  const { save, savingTarget } = useSaveToAddressBook();

  return (
    <div className="space-y-8">
      {[ROUTE_POINTS.FROM, ROUTE_POINTS.TO].map((config) => (
        <RoutePointCard
          key={config.target}
          config={config}
          form={form}
          updateForm={updateForm}
          saving={savingTarget === config.target}
          onOpenAddressBook={onOpenAddressBook}
          onSave={save}
        />
      ))}
      <RouteRoadPreviewCard form={form} />
      <TimeWindowCard form={form} updateForm={updateForm} />
    </div>
  );
}
