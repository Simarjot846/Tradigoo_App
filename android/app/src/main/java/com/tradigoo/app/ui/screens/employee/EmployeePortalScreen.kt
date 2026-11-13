package com.tradigoo.app.ui.screens.employee

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.api.ApiSupportTicket
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.data.repository.AuthRepository
import com.tradigoo.app.data.repository.SupportTicketRepository
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.ui.components.formatIsoDate
import com.tradigoo.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeePortalScreen(
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { SupportTicketRepository(context) }
    val authRepository = remember { AuthRepository(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val currentUser = sessionManager.getUser()
    val coroutineScope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    var tickets by remember { mutableStateOf<List<ApiSupportTicket>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isUpdatingTicket by remember { mutableStateOf(false) }
    var loadError by remember { mutableStateOf<String?>(null) }
    var selectedFilter by remember { mutableStateOf("ALL") }
    var selectedTicket by remember { mutableStateOf<ApiSupportTicket?>(null) }

    var showActionDialog by remember { mutableStateOf(false) }
    var actionNoteText by remember { mutableStateOf("") }
    var actionReplyText by remember { mutableStateOf("") }
    var actionType by remember { mutableStateOf("NOTE") }
    var newStatusChoice by remember { mutableStateOf("IN_PROGRESS") }

    fun refreshTickets() {
        isLoading = true
        loadError = null
        coroutineScope.launch {
            when (val res = repository.getTickets()) {
                is Resource.Success -> {
                    tickets = res.data
                }
                is Resource.Error -> {
                    loadError = res.message
                    snackbarHostState.showSnackbar(res.message)
                }
                else -> {}
            }
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        refreshTickets()
    }

    val filteredTickets = remember(tickets, selectedFilter) {
        if (selectedFilter == "ALL") tickets
        else tickets.filter { it.status.equals(selectedFilter, ignoreCase = true) }
    }

    val newCount = tickets.count { it.status.equals("NEW", ignoreCase = true) }
    val inProgressCount = tickets.count { it.status.equals("IN_PROGRESS", ignoreCase = true) }
    val resolvedCount = tickets.count { it.status.equals("RESOLVED", ignoreCase = true) }
    val escalatedCount = tickets.count { it.status.equals("ESCALATED", ignoreCase = true) }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            TopAppBar(
                windowInsets = WindowInsets.statusBars,
                title = {
                    Column {
                        Text(
                            text = "Tradigoo Operations Hub",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "Operations • ${currentUser?.email ?: "Support Team"}",
                            fontSize = 11.5.sp,
                            color = TradigooNavy,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { refreshTickets() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = TradigooNavy)
                    }
                    IconButton(
                        onClick = {
                            authRepository.logout()
                            onLogout()
                        }
                    ) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = TradigooError)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TradigooSurface)
            )
        },
        containerColor = TradigooBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricChip(label = "New", count = newCount, color = TradigooNavy, modifier = Modifier.weight(1f))
                MetricChip(label = "In Progress", count = inProgressCount, color = TradigooWarning, modifier = Modifier.weight(1f))
                MetricChip(label = "Escalated", count = escalatedCount, color = TradigooError, modifier = Modifier.weight(1f))
                MetricChip(label = "Resolved", count = resolvedCount, color = TradigooEmeraldDark, modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(14.dp))

            val filterOptions = listOf("ALL", "NEW", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "RESOLVED")
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(filterOptions) { opt ->
                    FilterChip(
                        selected = selectedFilter == opt,
                        onClick = { selectedFilter = opt },
                        label = { Text(opt.replace("_", " "), fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = TradigooNavy)
                }
            } else if (loadError != null && tickets.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = loadError ?: "Unable to load support queue.",
                            fontSize = 14.sp,
                            color = TradigooError,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { refreshTickets() },
                            colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                        ) {
                            Text("Retry")
                        }
                    }
                }
            } else if (filteredTickets.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = TradigooEmerald,
                            modifier = Modifier.size(52.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No tickets in this queue",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )
                        Text(
                            text = "All customer inquiries for this filter are up to date.",
                            fontSize = 13.sp,
                            color = TradigooTextSecondary,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredTickets, key = { it.id }) { ticket ->
                        TicketCard(
                            ticket = ticket,
                            onClick = { selectedTicket = ticket }
                        )
                    }
                }
            }
        }
    }

    if (selectedTicket != null) {
        val ticket = selectedTicket!!
        AlertDialog(
            onDismissRequest = { selectedTicket = null },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${ticket.ticketNumber} • ${ticket.category}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    TicketStatusBadge(status = ticket.status)
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState())) {
                    Text(text = ticket.subject, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TradigooTextPrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "Customer: ${ticket.customerName} (${ticket.customerEmail})", fontSize = 12.sp, color = TradigooTextSecondary)
                    if (!ticket.createdAt.isNullOrBlank()) {
                        Text(text = "Opened: ${formatIsoDate(ticket.createdAt)}", fontSize = 11.sp, color = TradigooTextTertiary)
                    }
                    if (ticket.orderId != null) {
                        Text(text = "Related Order: #${ticket.orderId.take(8).uppercase()}", fontSize = 12.sp, color = TradigooNavy)
                    }
                    if (ticket.assignedTo != null) {
                        Text(text = "Assigned To: ${ticket.assignedTo}", fontSize = 12.sp, color = TradigooTextSecondary)
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = TradigooCardBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    Text(text = "Internal Notes (${ticket.internalNotes.size})", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                    if (ticket.internalNotes.isEmpty()) {
                        Text(text = "No internal notes yet.", fontSize = 11.sp, color = TradigooTextTertiary)
                    } else {
                        ticket.internalNotes.forEach { note ->
                            Text(text = "• $note", fontSize = 11.sp, color = TradigooTextSecondary)
                        }
                    }

                    if (!ticket.resolutionNotes.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Resolution: ${ticket.resolutionNotes}",
                            fontSize = 12.sp,
                            color = TradigooEmeraldDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(
                        onClick = {
                            actionType = "NOTE"
                            showActionDialog = true
                        },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                    ) {
                        Text("Note", fontSize = 12.sp, maxLines = 1, softWrap = false)
                    }
                    Button(
                        onClick = {
                            actionType = "REPLY"
                            showActionDialog = true
                        },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooEmeraldDark)
                    ) {
                        Text("Reply", fontSize = 12.sp, maxLines = 1, softWrap = false)
                    }
                    Button(
                        onClick = {
                            actionType = "STATUS"
                            newStatusChoice = ticket.status
                            showActionDialog = true
                        },
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooGoldDark)
                    ) {
                        Text("Status", fontSize = 12.sp, maxLines = 1, softWrap = false)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedTicket = null }) {
                    Text("Close")
                }
            }
        )
    }

    if (showActionDialog && selectedTicket != null) {
        val ticket = selectedTicket!!
        AlertDialog(
            onDismissRequest = { if (!isUpdatingTicket) showActionDialog = false },
            title = {
                Text(
                    text = when (actionType) {
                        "NOTE" -> "Add Internal Note"
                        "REPLY" -> "Send Customer Reply"
                        "STATUS" -> "Change Ticket Status"
                        else -> "Update Ticket"
                    },
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    when (actionType) {
                        "NOTE" -> {
                            OutlinedTextField(
                                value = actionNoteText,
                                onValueChange = { actionNoteText = it },
                                placeholder = { Text("Enter internal investigation note...") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        "REPLY" -> {
                            OutlinedTextField(
                                value = actionReplyText,
                                onValueChange = { actionReplyText = it },
                                placeholder = { Text("Type official response to customer...") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        "STATUS" -> {
                            val statuses = listOf("ASSIGNED", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "ESCALATED", "RESOLVED", "CLOSED")
                            statuses.forEach { st ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { newStatusChoice = st }
                                        .padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(selected = newStatusChoice == st, onClick = { newStatusChoice = st })
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(st.replace("_", " "), fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                val canSubmit = !isUpdatingTicket && when (actionType) {
                    "NOTE" -> actionNoteText.isNotBlank()
                    "REPLY" -> actionReplyText.isNotBlank()
                    else -> true
                }
                Button(
                    enabled = canSubmit,
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy),
                    onClick = {
                        coroutineScope.launch {
                            isUpdatingTicket = true
                            val result = when (actionType) {
                                "NOTE" -> repository.updateTicket(
                                    id = ticket.id,
                                    internalNote = actionNoteText.trim(),
                                    senderName = currentUser?.name ?: "Support Agent"
                                )
                                "REPLY" -> repository.updateTicket(
                                    id = ticket.id,
                                    replyMessage = actionReplyText.trim(),
                                    senderName = currentUser?.name ?: "Support Agent"
                                )
                                else -> repository.updateTicket(
                                    id = ticket.id,
                                    status = newStatusChoice,
                                    assignedTo = currentUser?.email ?: "Operations Staff"
                                )
                            }
                            isUpdatingTicket = false

                            when (result) {
                                is Resource.Success -> {
                                    actionNoteText = ""
                                    actionReplyText = ""
                                    showActionDialog = false
                                    selectedTicket = null
                                    snackbarHostState.showSnackbar("Ticket ${ticket.ticketNumber} updated.")
                                    refreshTickets()
                                }
                                is Resource.Error -> {
                                    snackbarHostState.showSnackbar(result.message)
                                }
                                else -> {}
                            }
                        }
                    }
                ) {
                    Text(if (isUpdatingTicket) "Updating..." else "Apply")
                }
            },
            dismissButton = {
                TextButton(enabled = !isUpdatingTicket, onClick = { showActionDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun TicketCard(ticket: ApiSupportTicket, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
        border = BorderStroke(1.dp, TradigooCardBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ticket.ticketNumber,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooNavy
                )
                TicketStatusBadge(status = ticket.status)
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = ticket.subject,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = TradigooTextPrimary
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "By ${ticket.customerName} • ${ticket.category}",
                fontSize = 12.sp,
                color = TradigooTextSecondary
            )
        }
    }
}

@Composable
private fun TicketStatusBadge(status: String) {
    val (bg, fg) = when (status.uppercase()) {
        "NEW" -> Pair(TradigooNavyBg, TradigooNavy)
        "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_CUSTOMER" -> Pair(TradigooWarningBg, TradigooWarning)
        "ESCALATED" -> Pair(TradigooErrorBg, TradigooError)
        "RESOLVED", "CLOSED" -> Pair(TradigooEmeraldBg, TradigooEmeraldDark)
        else -> Pair(TradigooSurfaceElevated, TradigooTextSecondary)
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(text = status.replace("_", " "), color = fg, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun MetricChip(label: String, count: Int, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
        border = BorderStroke(1.dp, TradigooCardBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = count.toString(), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color, maxLines = 1)
            Text(text = label, fontSize = 10.sp, color = TradigooTextSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}
