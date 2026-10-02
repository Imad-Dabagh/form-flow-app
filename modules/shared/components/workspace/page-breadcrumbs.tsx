import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/modules/shared/components/ui/breadcrumb";

export function PageBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="min-w-0 flex-nowrap">
        {items.map((item, index) => (
          <Fragment key={`${index}-${item.label}`}>
            {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
            <BreadcrumbItem className="min-w-0">
              {item.href && index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link
                    className="truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={item.href}
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate" title={item.label}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
