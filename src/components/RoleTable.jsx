import React from 'react';

export default function RoleTable({ roles, onEdit, onDelete }) {
	return (
		<table border="1" cellPadding="5" style={{ marginTop: 20 }}>
			<thead>
				<tr>
					<th>ID</th>
					<th>Nume</th>
					<th>Acțiuni</th>
				</tr>
			</thead>
			<tbody>
				{roles.map(r => (
					<tr key={r.id}>
						<td>{r.id}</td>
						<td>{r.name}</td>
						<td>
							<button onClick={() => onEdit(r)}>Editează</button>
							<button onClick={() => onDelete(r.id)}>Șterge</button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
