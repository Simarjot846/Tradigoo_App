package com.tradigoo.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloseFullscreen
import androidx.compose.material.icons.filled.OpenInFull
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.api.ApiChatHistoryItem
import com.tradigoo.app.data.repository.AiAssistantRepository
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.theme.*
import kotlinx.coroutines.launch

data class ChatMessage(
    val sender: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TradigooAiAssistantDialog(
    role: UserRole,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val configuration = LocalConfiguration.current
    val repository = remember { AiAssistantRepository(context) }
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var isExpanded by remember { mutableStateOf(false) }

    val initialMessage = if (role == UserRole.WHOLESALER) {
        "Hello! I am your Tradigoo Trade Assistant. Ask about wholesale MOQs, escrow payout releases, or GST verification."
    } else {
        "Hello! I am Tradigoo's Sourcing Assistant. Ask about bulk sourcing, escrow protection, or 24-hour delivery inspection."
    }

    val messages = remember {
        mutableStateListOf(
            ChatMessage(sender = "Tradigoo Assistant", text = initialMessage, isUser = false)
        )
    }

    val samplePrompts = if (role == UserRole.WHOLESALER) {
        listOf(
            "How do I set wholesale MOQs?",
            "How does escrow payout release work?",
            "Explain 24h inspection",
            "How is Trust Score calculated?"
        )
    } else {
        listOf(
            "How does escrow protection work?",
            "What is 24h delivery inspection?",
            "How do I verify delivery OTP?",
            "How to report damaged goods?"
        )
    }

    LaunchedEffect(messages.size, isLoading) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    fun sendMessage(prompt: String) {
        val clean = prompt.trim()
        if (clean.isEmpty() || isLoading) return

        val history = messages.drop(1).takeLast(6).map { msg ->
            ApiChatHistoryItem(
                role = if (msg.isUser) "user" else "assistant",
                content = msg.text
            )
        }

        messages.add(ChatMessage(sender = "You", text = clean, isUser = true))
        isLoading = true
        coroutineScope.launch {
            when (val result = repository.askAssistant(clean, history)) {
                is Resource.Success -> {
                    messages.add(ChatMessage(sender = "Tradigoo Assistant", text = result.data, isUser = false))
                }
                is Resource.Error -> {
                    messages.add(ChatMessage(sender = "Tradigoo Assistant", text = result.message, isUser = false))
                }
                else -> {}
            }
            isLoading = false
        }
    }

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val screenHeight = configuration.screenHeightDp.dp
    val targetSheetHeight = (screenHeight * if (isExpanded) 0.92f else 0.75f).coerceAtLeast(360.dp)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        containerColor = TradigooSurface,
        contentColor = TradigooTextPrimary,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 10.dp, bottom = 4.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(CircleShape)
                    .background(TradigooCardBorder)
            )
        },
        contentWindowInsets = { WindowInsets(0, 0, 0, 0) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .height(targetSheetHeight)
                .navigationBarsPadding()
                .imePadding()
        ) {
            // Compact Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(TradigooBrandGradient),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = TradigooGoldLight,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Tradigoo Trade Assistant",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "B2B Trade & Support Assistant",
                            fontSize = 11.5.sp,
                            color = TradigooTextSecondary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { isExpanded = !isExpanded },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = if (isExpanded) Icons.Default.CloseFullscreen else Icons.Default.OpenInFull,
                            contentDescription = if (isExpanded) "Compact view" else "Expand full height",
                            tint = TradigooTextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close assistant",
                            tint = TradigooTextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            HorizontalDivider(color = TradigooCardBorder)

            // Horizontally Scrollable Suggested Prompts
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(samplePrompts) { prompt ->
                    Surface(
                        onClick = { sendMessage(prompt) },
                        shape = RoundedCornerShape(10.dp),
                        color = TradigooNavyBg,
                        border = BorderStroke(1.dp, TradigooNavy.copy(alpha = 0.18f))
                    ) {
                        Text(
                            text = prompt,
                            fontSize = 11.5.sp,
                            color = TradigooNavy,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            softWrap = false,
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // Independently Scrollable Chat Thread
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(message = msg)
                }

                if (isLoading) {
                    item {
                        Row(
                            modifier = Modifier.padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = TradigooNavy
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Fetching Tradigoo trade guidance...",
                                fontSize = 12.sp,
                                color = TradigooTextSecondary
                            )
                        }
                    }
                }
            }

            // Bottom Input Composer (Always visible above keyboard & nav bar)
            Surface(
                color = TradigooSurface,
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    HorizontalDivider(color = TradigooCardBorder)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = {
                                Text(
                                    text = "Ask about escrow, orders, or products...",
                                    fontSize = 13.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TradigooNavy,
                                unfocusedBorderColor = TradigooCardBorder,
                                focusedContainerColor = TradigooBackground,
                                unfocusedContainerColor = TradigooBackground
                            ),
                            maxLines = 3
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        IconButton(
                            enabled = inputText.isNotBlank() && !isLoading,
                            onClick = {
                                val prompt = inputText.trim()
                                if (prompt.isNotEmpty()) {
                                    inputText = ""
                                    sendMessage(prompt)
                                }
                            },
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(
                                    if (inputText.isNotBlank() && !isLoading) TradigooNavy else TradigooCardBorder
                                )
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "Send",
                                tint = if (inputText.isNotBlank() && !isLoading) TradigooGoldLight else Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatBubble(message: ChatMessage) {
    val alignment = if (message.isUser) Alignment.End else Alignment.Start
    val bg = if (message.isUser) TradigooNavy else TradigooSurfaceElevated
    val textColor = if (message.isUser) Color.White else TradigooTextPrimary

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (message.isUser) 16.dp else 4.dp,
                bottomEnd = if (message.isUser) 4.dp else 16.dp
            ),
            color = bg,
            border = if (!message.isUser) BorderStroke(1.dp, TradigooCardBorder) else null,
            modifier = Modifier.widthIn(max = 300.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (!message.isUser) {
                    Text(
                        text = message.sender,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooGoldDark
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                }
                Text(
                    text = message.text,
                    fontSize = 13.sp,
                    color = textColor,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
