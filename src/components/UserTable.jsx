import React from 'react';

export default function UserTable({ users, roles, onEdit, onDelete }) {
	return (
		<table border="1" cellPadding="5" style={{ marginTop: 20 }}>
			<thead>
				<tr>
					<th>ID</th>
					<th>Username</th>
					<th>Email</th>
					<th>Prenume</th>
					<th>Nume</th>
					<th>Telefon</th>
					<th>Rol</th>
					<th>Acțiuni</th>
				</tr>
			</thead>
			<tbody>
				{users.map(u => (
					<tr key={u.id}>
						<td>{u.id}</td>
						<td>{u.username}</td>
						<td>{u.email}</td>
						<td>{u.first_name}</td>
						<td>{u.last_name}</td>
						<td>{u.phone}</td>
						<td>{roles.find(r => r.id === u.role_id)?.name}</td>
						<td>
							<button onClick={() => onEdit(u)}>Editează</button>
							<button onClick={() => onDelete(u.id)}>Șterge</button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
