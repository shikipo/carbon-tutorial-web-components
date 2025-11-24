import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/link/index';
import '@carbon/web-components/es/components/pagination/index';

import { Octokit } from '@octokit/core';
const octokitClient = new Octokit({});

let data = [];
let pageSize = 10;
let firstRowIndex = 0;

const fetchData = async () => {
	const res = await octokitClient.request('GET /orgs/{org}/repos', {
		org: 'carbon-design-system',
		per_page: 75,
		sort: 'updated',
		direction: 'desc',
	});

	if (res.status === 200) {
		data = res.data.map((row) => ({
			name: row.name,
			created: new Date(row.created_at).toLocaleDateString(),
			updated: new Date(row.updated_at).toLocaleDateString(),
			openIssues: row.open_issues_count,
			stars: row.stargazers_count,
			links: { url: row.html_url, homepage: row.homepage },
			expansion: row.description,
		}));

		// replace table here
		replaceSkeleton();
	} else {
		console.log('Error obtaining repository data');
	}
};
fetchData();

const updateTable = () => {
	const tableRowTemplate = document.querySelector(
		'template#template--table-row',
	);
	const tableBody = document.querySelector('cds-table-body');
	if (tableBody && tableRowTemplate) {
		tableBody.innerHTML = '';
		data
			.filter((v, i) => i >= firstRowIndex && i < firstRowIndex + pageSize)
			.forEach((row) => {
				let newRow = tableRowTemplate.content.cloneNode(true);
				const keys = Object.keys(row);
				keys.forEach((key) => {
					const keyEl = newRow.querySelector(`[key="${key}"]`);
					if (key === 'links') {
						keyEl.innerHTML = `<ul class="link-list">
					<li>
						<cds-link href="${row[key].url}">GitHub</cds-link>
					</li>
					<li>
						<cds-link href="${row[key].homepage}">Homepage</cds-link>
					</li>
				</ul>`;
					} else {
						keyEl.innerHTML = row[key];
					}
				});
				tableBody.appendChild(newRow);
			});
	}
};

const replaceSkeleton = () => {
	const tableSkeleton = document.querySelector('cds-table-skeleton');
	const tableTemplate = document.querySelector('template#template--table');

	if (tableSkeleton && tableTemplate) {
		tableSkeleton.replaceWith(tableTemplate.content.cloneNode(true));
		// update table rows
		updateTable();
		// update pagination
		updatePagination();
	}
};

// === pagination handlers ===

// update first row index and refresh table
const handlePageChangeCurrent = ({ detail }) => {
	firstRowIndex = (detail.page - 1) * detail.pageSize;
	updateTable();
};

// update page size and refresh table
const handlePageSizeChange = ({ detail }) => {
	pageSize = detail.pageSize;
	updateTable();
};

// update pagination component
const updatePagination = () => {
	// update pagination to match data fetched
	const paginationEl = document.querySelector('cds-pagination');
	paginationEl.setAttribute('total-items', data.length);

	setTimeout(() => {
		// defer until after the dom is updated
		paginationEl.addEventListener(
			'cds-pagination-changed-current',
			handlePageChangeCurrent
		);
		paginationEl.addEventListener(
			'cds-page-sizes-select-changed',
			handlePageSizeChange
		);
	}, 10);
};
