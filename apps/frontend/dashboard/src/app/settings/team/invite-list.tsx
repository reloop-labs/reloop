"use client";

import * as Avatar from "@reloop/ui/components/avatar";
import * as Checkbox from "@reloop/ui/components/checkbox";
import * as FileFormatIcon from "@reloop/ui/components/file-format-icon";
import { Icon } from "@reloop/ui/components/icon";
import * as StatusBadge from "@reloop/ui/components/status-badge";
import * as Table from "@reloop/ui/components/table";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

const data: Data[] = [
	{
		id: "326860c3",
		member: {
			name: "James Brown",
			email: "james@alignui.com",
			image: "/images/avatar/illustration/james.png",
		},
		title: {
			name: "Marketing Manager",
			date: "Since Aug, 2021",
		},
		project: {
			name: "Monday.com",
			description: "Campaign Strategy Brainstorming",
			image: ["/images/major-brands/monday.svg"],
		},
		doc: {
			name: "brown-james.pdf",
			size: "2.4 MB",
		},
		status: {
			variant: "completed",
			label: "Active",
		},
	},
	{
		id: "8a2c57d0",
		member: {
			name: "Sophia Williams",
			email: "sophia@alignui.com",
			image: "/images/avatar/illustration/sophia.png",
		},
		title: {
			name: "HR Assistant",
			date: "Since Aug, 2021",
		},
		project: {
			name: "Notion",
			description: "Employee Engagement Survey",
			image: [
				"/images/major-brands/notion.svg",
				"/images/major-brands/notion-white.svg",
			],
		},
		doc: {
			name: "williams-sophia.pdf",
			size: "2.4 MB",
		},
		status: {
			variant: "completed",
			label: "Active",
		},
	},
	{
		id: "1a6256ab",
		member: {
			name: "Arthur Taylor",
			email: "arthur@alignui.com",
			image: "/images/avatar/illustration/arthur.png",
		},
		title: {
			name: "Entrepreneur / CEO",
			date: "Since May, 2022",
		},
		project: {
			name: "Spotify",
			description: "Vision and Goal Setting Session",
			image: ["/images/major-brands/spotify.svg"],
		},
		doc: {
			name: "taylor-arthur.pdf",
			size: "2.4 MB",
		},
		status: {
			variant: "disabled",
			label: "Absent",
		},
	},
	{
		id: "9f92efe3",
		member: {
			name: "Emma Wright",
			email: "emma@alignui.com",
			image: "/images/avatar/illustration/emma.png",
		},
		title: {
			name: "Front-end Developer",
			date: "Since Sep, 2022",
		},
		project: {
			name: "Formcarry",
			description: "User Feedback Analysis",
			image: ["/images/major-brands/formcarry.svg"],
		},
		doc: {
			name: "wright-emma.pdf",
			size: "1.9 MB",
		},
		status: {
			variant: "completed",
			label: "Active",
		},
	},
	{
		id: "a5b7b936",
		member: {
			name: "Matthew Johnson",
			email: "matthew@alignui.com",
			image: "/images/avatar/illustration/matthew.png",
		},
		title: {
			name: "Data Software Engineer",
			date: "Since Feb, 2022",
		},
		project: {
			name: "Loom",
			description: "Data Analysis Methodology",
			image: ["/images/major-brands/loom.svg"],
		},
		doc: {
			name: "johnson-matthew.pdf",
			size: "2.9 MB",
		},
		status: {
			variant: "completed",
			label: "Active",
		},
	},
	{
		id: "0153ab9a",
		member: {
			name: "Laura Perez",
			email: "laura@alignui.com",
			image: "/images/avatar/illustration/laura.png",
		},
		title: {
			name: "Fashion Designer",
			date: "Since Mar, 2022",
		},
		project: {
			name: "Tidal",
			description: "Design Trends and Inspirations",
			image: [
				"/images/major-brands/tidal.svg",
				"/images/major-brands/tidal-white.svg",
			],
		},
		doc: {
			name: "perez-laura.pdf",
			size: "2.5 MB",
		},
		status: {
			variant: "disabled",
			label: "Absent",
		},
	},
	{
		id: "e18b8b38",
		member: {
			name: "Wei Chen",
			email: "wei@alignui.com",
			image: "/images/avatar/illustration/wei.png",
		},
		title: {
			name: "Operations Manager",
			date: "Since July, 2021",
		},
		project: {
			name: "Dropbox",
			description: "Process Optimization Brainstorming",
			image: ["/images/major-brands/dropbox.svg"],
		},
		doc: {
			name: "chen-wei.pdf",
			size: "2.6 MB",
		},
		status: {
			variant: "completed",
			label: "Active",
		},
	},
];

type Data = {
	id: string;
	member: {
		name: string;
		email: string;
		image: string;
	};
	title: {
		name: string;
		date: string;
	};
	project: {
		name: string;
		description: string;
		image: [string, string?];
	};
	doc: {
		name: string;
		size: string;
	};
	status: {
		variant: "completed" | "pending" | "failed" | "disabled";
		label: string;
	};
};

const getSortingIcon = (state: "asc" | "desc" | false) => {
	if (state === "asc")
		return <Icon name="arrow-up-s-fill" className="size-5 text-text-sub-600" />;
	if (state === "desc")
		return (
			<Icon name="arrow-down-s-fill" className="size-5 text-text-sub-600" />
		);
	return (
		<Icon name="expand-up-down-fill" className="size-5 text-text-sub-600" />
	);
};

const columns: ColumnDef<Data>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox.Root
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox.Root
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "member",
		accessorKey: "member.name",
		header: ({ column }) => (
			<div className="flex items-center gap-0.5">
				Member Name
				<button
					type="button"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{getSortingIcon(column.getIsSorted())}
				</button>
			</div>
		),
		enableSorting: true,
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				<Avatar.Root size="40">
					<Avatar.Image src={row.original.member.image} />
				</Avatar.Root>
				<div className="flex flex-col gap-0.5">
					<span className="text-label-sm text-text-strong-950">
						{row.original.member.name}
					</span>
					<span className="text-paragraph-xs text-text-sub-600">
						{row.original.member.email}
					</span>
				</div>
			</div>
		),
	},
	{
		id: "title",
		accessorKey: "title.name",
		header: ({ column }) => (
			<div className="flex min-w-36 items-center gap-0.5">
				Title
				<button
					type="button"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{getSortingIcon(column.getIsSorted())}
				</button>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex flex-col gap-0.5">
				<span className="text-label-sm text-text-strong-950">
					{row.original.title.name}
				</span>
				<span className="text-paragraph-xs text-text-sub-600">
					{row.original.title.date}
				</span>
			</div>
		),
	},
	{
		id: "project",
		accessorKey: "project.name",
		header: ({ column }) => (
			<div className="flex min-w-48 items-center gap-0.5">
				Projects
				<button
					type="button"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{getSortingIcon(column.getIsSorted())}
				</button>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
					<picture>
						{row.original.project.image.length > 1 && (
							<source
								srcSet={row.original.project.image[1]}
								media="(prefers-color-scheme: dark)"
							/>
						)}
						<img
							src={row.original.project.image[0]}
							alt=""
							width={28}
							height={28}
						/>
					</picture>
				</div>
				<div className="flex flex-col gap-0.5">
					<span className="text-label-sm text-text-strong-950">
						{row.original.project.name}
					</span>
					<span className="text-paragraph-xs text-text-sub-600">
						{row.original.project.description}
					</span>
				</div>
			</div>
		),
	},
	{
		id: "doc",
		accessorKey: "doc.name",
		header: ({ column }) => (
			<div className="flex items-center gap-0.5 whitespace-nowrap">
				Member Documents
				<button
					type="button"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{getSortingIcon(column.getIsSorted())}
				</button>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				<FileFormatIcon.Root format="PDF" size="small" color="red" />
				<div className="flex flex-col gap-0.5">
					<span className="text-label-sm text-text-strong-950">
						{row.original.doc.name}
					</span>
					<span className="text-paragraph-xs text-text-sub-600">
						{row.original.doc.size}
					</span>
				</div>
			</div>
		),
	},
	{
		id: "status",
		accessorKey: "status.label",
		header: ({ column }) => (
			<div className="flex items-center gap-0.5">
				Status
				<button
					type="button"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					{getSortingIcon(column.getIsSorted())}
				</button>
			</div>
		),
		cell: ({ row }) => (
			<StatusBadge.Root status={row.original.status.variant}>
				{row.original.status.label}
			</StatusBadge.Root>
		),
	},
];

export const InviteList = () => {
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
		initialState: {
			sorting: [
				{
					id: "member",
					desc: true,
				},
			],
		},
	});

	return (
		<div className="w-full max-w-[1104px]">
			<Table.Root>
				<Table.Header>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Row key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<Table.Head key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</Table.Head>
								);
							})}
						</Table.Row>
					))}
				</Table.Header>
				<Table.Body>
					{table.getRowModel().rows?.length > 0 &&
						table.getRowModel().rows.map((row, i, arr) => (
							<React.Fragment key={row.id}>
								<Table.Row data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<Table.Cell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</Table.Cell>
									))}
								</Table.Row>
								{i < arr.length - 1 && <Table.RowDivider />}
							</React.Fragment>
						))}
				</Table.Body>
			</Table.Root>
		</div>
	);
};
