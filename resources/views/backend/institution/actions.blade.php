<div class="btn-group gap-2" role="group">
    <a href="{{ route('reports.institution.forwarding.letter', $row->id) }}" class="btn btn-sm rounded btn-outline-success">
        <i class="bi bi-file-pdf text-danger"></i> Letter
    </a>
    <button class="btn btn-sm rounded btn-outline-primary edit-btn" data-id={{ $row->id }}>
        <i class="bi bi-pencil"></i> Edit
    </button>
    <button class="btn btn-sm rounded btn-outline-danger delete-btn" data-id={{ $row->id }}>
        <i class="bi bi-trash"></i> Delete
    </button>
</div>