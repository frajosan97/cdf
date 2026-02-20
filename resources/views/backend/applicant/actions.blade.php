<div class="btn-group gap-2" role="group">
    <button class="btn btn-sm rounded btn-info view-btn" data-id={{ $row->id }}>
        <i class="bi bi-eye"></i>
    </button>
    <button class="btn btn-sm rounded btn-info edit-btn" data-id={{ $row->id }}>
        <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-sm rounded btn-danger delete-btn" data-id={{ $row->id }}>
        <i class="bi bi-trash"></i>
    </button>
</div>