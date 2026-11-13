package com.tradigoo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
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

@Composable
fun TradigooAiAssistantDialog(
    role: UserRole,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AiAssistantRepository(context) }
    val coroutineScope = rememberCoroutineScope()

    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

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
            "Explain the 24h inspection workflow",
            "How is my supplier Trust Score calculated?"
        )
    } else {
        listOf(
            "How does escrow payment protection work?",
            "What happens during 24h delivery inspection?",
            "How do I verify delivery with OTP?",
            "How do I report damaged bulk goods?"
        )
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

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .imePadding()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            color = TradigooSurface,
            tonalElevation = 12.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(TradigooBrandGradient),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = TradigooGoldLight,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Tradigoo Trade Assistant",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                            Text(
                                text = "AI Trade & Support Assistant",
                                fontSize = 12.sp,
                                color = TradigooTextSecondary
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TradigooTextSecondary)
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = TradigooCardBorder)

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(samplePrompts) { prompt ->
                        Surface(
                            onClick = { sendMessage(prompt) },
                            shape = RoundedCornerShape(12.dp),
                            color = TradigooNavyBg,
                            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooNavy.copy(alpha = 0.2f))
                        ) {
                            Text(
                                text = prompt,
                                fontSize = 11.sp,
                                color = TradigooNavy,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    reverseLayout = false
                ) {
                    items(messages) { msg ->
                        ChatBubble(message = msg)
                        Spacer(modifier = Modifier.height(10.dp))
                    }

                    if (isLoading) {
                        item {
                            Row(
                                modifier = Modifier.padding(8.dp),
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

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Ask about escrow, orders, or products...", fontSize = 13.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TradigooNavy,
                            unfocusedBorderColor = TradigooCardBorder
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = {
                            val prompt = inputText.trim()
                            if (prompt.isNotEmpty()) {
                                inputText = ""
                                sendMessage(prompt)
                            }
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(if (inputText.isNotBlank()) TradigooNavy else TradigooCardBorder)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send",
                            tint = Color.White
                        )
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
            border = if (!message.isUser) androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder) else null,
            modifier = Modifier.widthIn(max = 285.dp)
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
