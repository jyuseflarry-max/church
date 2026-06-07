import { requireTeachingAdmin } from "../auth";

export default async function TeachingLibraryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeachingAdmin();
  return children;
}
